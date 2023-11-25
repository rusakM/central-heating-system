import { NextFunction, Response } from "express";

import Home, { IHome } from "../models/homeModel";
import UserHome, { IUserHome } from "../models/userHomeModel";
import User from "../models/userModel";

import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import { IRequest } from "../utils/globalTypes";

export const createHome = catchAsync(
    async (req: IRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError("Najpierw należy się zalogować", 401));
        }

        let home: IHome = await Home.create(req.body);

        if (!home) {
            return next(new AppError("Nie można utworzyć", 404));
        }

        home = home.toJSON();

        let userHome: IUserHome = await UserHome.create({
            home: home._id,
            user: req.user._id,
        });

        res.status(200).json({
            status: "success",
            data: {
                home,
                userHome,
            },
        });
    }
);

export const inviteUser = catchAsync(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { user, home } = req.body;

        if ((await User.findById(user)) && (await Home.findById(home))) {
            return res.status(200).json({
                status: "success",
                data: {
                    ...req.body,
                    homeOwner: req.user._id,
                },
            });
        }

        next(new AppError("Nie można zaprosić użytkownika", 404));
    }
);

export const claimHome = catchAsync(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { user, home } = req.body;

        let userHome: IUserHome | null = await UserHome.findOne({ user, home });

        if (userHome) {
            if (!userHome.active) {
                userHome = await UserHome.findByIdAndUpdate(userHome._id, {
                    active: true,
                });
            } else {
                return next(
                    new AppError(
                        "Podany użytkownik już jest przypisany do domu",
                        404
                    )
                );
            }
        } else {
            userHome = await UserHome.create({ user, home });
        }

        res.status(200).json({
            status: "success",
            data: {
                ...userHome,
            },
        });
    }
);

export const blockUserHome = catchAsync(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { user, home } = req.body;

        if (
            await UserHome.findOneAndUpdate({ user, home }, { active: false })
        ) {
            return res.status(200).json({
                status: "success",
                data: {
                    user,
                    home,
                    active: false,
                },
            });
        }

        next(new AppError("Nie można zablokować użytkownika", 404));
    }
);
