import { NextFunction, Response } from "express";
import Sensor, { ISensor } from "../models/sensorModel";
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
