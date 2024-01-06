import { NextFunction, Response } from "express";
import Sensor, { ISensor } from "../models/sensorModel";
import Board, { IBoard } from "../models/boardModel";
import * as handlerFactory from "./handlerFactory";

import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import { IRequest } from "../utils/globalTypes";

export const createSensor = catchAsync(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { name } = req.body;
        let sensor: ISensor | null = await Sensor.findOne<ISensor>({ name });

        if (!sensor) {
            sensor = await Sensor.create(req.body);
        } else {
            sensor = await Sensor.findOneAndUpdate({ name }, { active: true });
        }

        res.status(201).json({
            status: "success",
            data: sensor,
        });
    }
);

export const getAll = handlerFactory.getAll(Sensor);

export const getOne = handlerFactory.getOne(Sensor);

export const updateOne = handlerFactory.updateOne(Sensor);

export const deleteSensor = catchAsync(
    async (req: IRequest, res: Response, next: NextFunction) => {
        try {
            const { sensor } = req.body;
            const s: ISensor | null = await Sensor.findByIdAndUpdate(sensor, {
                active: false,
            });

            return res.status(200).json({
                status: "success",
                data: s,
            });
        } catch (error) {
            return next(new AppError("Nie znaleziono czujnika", 404));
        }
    }
);

export function selectActiveSensors(
    req: IRequest,
    res: Response,
    next: NextFunction
) {
    req.query.active = "true";

    next();
}

export const initializeBoardSensors = catchAsync(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const id = req.board?.id;
        const activeSensors = req.body.sensors;

        if (!id) {
            return next(new AppError("Płytka nie istnieje", 404));
        }

        if (!activeSensors && !activeSensors.length) {
            return res.status(200).json({
                status: "success",
                data: [],
            });
        }

        let sensors: ISensor | Array<any> | null = await Sensor.find({
            board: id,
        });

        if (!sensors) {
            sensors = [];
        } else {
            for (const sensor of activeSensors) {
                const sensorFromDb = sensors.find(
                    (item: ISensor) => item.name === sensor
                );

                if (!sensorFromDb) {
                    await Sensor.create({
                        name: sensor,
                        board: id,
                    });
                } else {
                    if (!sensorFromDb.active) {
                        await Sensor.findByIdAndUpdate(sensorFromDb._id, {
                            active: true,
                        });
                    }
                }
            }

            for (const sensor of sensors) {
                const sensorFromBoard = activeSensors.find(
                    (item: string) => item === sensor.name
                );

                if (!sensorFromBoard && sensor.active) {
                    await Sensor.findByIdAndUpdate(sensor._id, {
                        active: false,
                    });
                }
            }

            sensors = await Sensor.find({ board: id, active: true });
        }

        res.status(200).json({
            status: "success",
            data: sensors,
        });
    }
);
