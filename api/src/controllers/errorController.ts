import { NextFunction, Response } from "express";
import AppError from "../utils/appError";
import { IRequest } from "../utils/globalTypes";
import { CastError, Error } from "mongoose";

const handleCastErrorDb = (err: CastError) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDb = (err: any) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please try another value`;
    return new AppError(message, 400);
};

const handleValidationErrorDb = (err: Error.ValidationError) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(", ")}`;
    return new AppError(message, 400);
};

const handleJWTExpiredError = () => {
    return new AppError("Token expired. Please login again", 401);
};

const sendErrorDev = (err: any, req: IRequest, res: Response) => {
    if (req.originalUrl.startsWith("/api")) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err,
        });
    }

    return res.status(err.statusCode).json({
        status: "error",
        title: "Something went wrong!",
        msg: err.message,
    });
};

const handleJWTError = () => {
    return new AppError("Invalid token. Please login again", 401);
};

const sendErrorProd = (err: AppError, req: IRequest, res: Response) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        // Programming or other unknown error, don't leak error details
    }
    // 1) log error
    console.log("ERROR ", err);
    // 2) send generic message
    res.status(500).json({
        status: "error",
        message: "Something went wrong!",
    });
};

export default (err: any, req: IRequest, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = { ...err };
        error.message = err.message;
        if (err.name === "CastError") {
            error = handleCastErrorDb(error);
        }
        if (err.code === 11000) {
            error = handleDuplicateFieldsDb(error);
        }

        if (err.name === "ValidationError") {
            error = handleValidationErrorDb(error);
        }
        if (err.name === "JsonWebTokenError") {
            error = handleJWTError();
        }
        if (err.name === "TokenExpiredError") {
            error = handleJWTExpiredError();
        }
        sendErrorProd(error, req, res);
    }
};
