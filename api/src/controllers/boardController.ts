import { NextFunction, Response } from "express";

import Alarm from "../models/alarmModel";
import Board, { IBoard } from "../models/boardModel";
import Temperature from "../models/temperatureModel";
import UserHome, { IUserHome } from "../models/userHomeModel";
import { userRoles } from "../models/userModel";

import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import { IRequest } from "../utils/globalTypes";
import { createOne, updateOne } from "./handlerFactory";

export const checkBoardRestrictions = catchAsync(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { _id, role } = req.user;
        const boardId = req.params.id;

        const board: IBoard | null = await Board.findById(boardId);

        if (!board) {
            return next(new AppError("Podana płytka nie istnieje", 404));
        }

        if (role === userRoles.user) {
            const userHome: IUserHome | null = await UserHome.findOne({
                user: _id,
                home: board.home,
            });

            if (!userHome) {
                return next(
                    new AppError("Brak uprawnień do podanej płytki", 404)
                );
            }
        }

        req.board = board.toJSON();

        next();
    }
);

export const createBoard = createOne(Board);

export const updateBoard = updateOne(Board);

export function getBoard(req: IRequest, res: Response, next: NextFunction) {
    const { board } = req;
    if (!board) {
        return next(new AppError("Podana płytka nie istnieje", 404));
    }

    res.status(200).json({
        status: "success",
        data: board,
    });
}

export function selectBoard(req: IRequest, res: Response, next: NextFunction) {
    req.query.board = req.params.id;
    next();
}
