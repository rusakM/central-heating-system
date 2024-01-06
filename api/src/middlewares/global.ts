import { Response, NextFunction } from "express";
import { IRequest } from "../utils/globalTypes";

export const limit =
    (limit: string) => (req: IRequest, res: Response, next: NextFunction) => {
        req.query.limit = limit;

        next();
    };

export const getLatest =
    (field: string) => (req: IRequest, res: Response, next: NextFunction) => {
        req.query.sort = `-${field}`;

        next();
    };
