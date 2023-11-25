import { Request, Response, NextFunction } from "express";

import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";

import { IRequest } from "../utils/globalTypes";

import User, { IUserDocument } from "../models/userModel";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";

declare module "jsonwebtoken" {
    export interface IJWTPayload extends jwt.JwtPayload {
        id?: string;
    }
}

const secret: jwt.Secret = String(process.env.JWT_SECRET);

const signToken = (id: String) =>
    jwt.sign({ id }, String(secret), {
        expiresIn: String(process.env.JWT_EXPIRES),
    });

const createSendToken = (
    user: any,
    statusCode: number,
    req: Request,
    res: Response
) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() +
                Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    };

    user.password = undefined;

    res.cookie("jwt", token, cookieOptions).status(statusCode).json({
        status: "success",
        token,
        tokenExpires: cookieOptions.expires.getTime(),
        data: {
            user,
        },
    });
};

export const signup = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
        });

        createSendToken(newUser, 201, req, res);
    }
);

export const login = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(
                new AppError("Nie podano adresu email lub hasła.", 400)
            );
        }
        const user: IUserDocument = await User.findOne({ email }).select(
            "+password"
        );

        if (
            !user ||
            (user.correctPassword &&
                !(await user.correctPassword(password, String(user.password))))
        ) {
            return next(new AppError("Niepoprawny email lub hasło.", 401));
        }

        createSendToken(user, 200, req, res);
    }
);

export const logout = (req: Request, res: Response) => {
    res.cookie("jwt", "logedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    })
        .status(200)
        .json({
            status: "success",
        });
};

export const protect = catchAsync(
    async (req: IRequest, res: Response, next: NextFunction) => {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return next(new AppError("Najpierw należy się zalogować.", 401));
        }

        const decoded: jwt.IJWTPayload = <jwt.IJWTPayload>(
            jwt.verify(token, secret)
        );

        console.log(decoded.iat);

        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            return next(
                new AppError("Niepoprawny token. Zaloguj się jeszcze raz.", 401)
            );
        }

        if (
            currentUser.changedPasswordAfter &&
            currentUser.changedPasswordAfter(Number(decoded.iat))
        ) {
            return next(
                new AppError(
                    "Hasło zostało zmienione od ostatniego logowania. Zaloguj się ponownie.",
                    401
                )
            );
        }

        req.user = currentUser;
        res.locals.user = currentUser;
        next();
    }
);

export async function jwtVerify(token: string, secret: string): Promise<any> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded);
        });
    });
}
