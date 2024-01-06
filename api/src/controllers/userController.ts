import { Response, NextFunction } from "express";

import Board, { IBoard } from "../models/boardModel";
import User from "../models/userModel";
import UserHome from "../models/userHomeModel";
import catchAsync from "../utils/catchAsync";
import { getAll, getOne, updateOne, deleteOne } from "./handlerFactory";
import { IRequest } from "../utils/globalTypes";
import AppError from "../utils/appError";

export const getAllUsers = getAll(User);
export const getUser = getOne(User);
export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);

export const getMe = catchAsync(
    async (req: IRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError("Jesteś niezalogowany", 404));
        }

        const userInfo = await User.findById(req.user.id);
        const userHomes = await (await UserHome.find({ user: req.user.id }))
            .filter((userHome) => userHome.active)
            .map((userHome) => userHome.home);

        const homesIds = userHomes.map((home) => home.id);
        let userBoards: IBoard[] = [];

        for (const home of homesIds) {
            const boards: IBoard[] = await Board.find({
                home,
            });

            userBoards = [...userBoards, ...boards];
        }

        res.status(200).json({
            status: "success",
            data: {
                me: userInfo,
                homes: userHomes,
                boards: userBoards,
            },
        });
    }
);
