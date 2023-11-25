import { Response, NextFunction } from "express";

import { IRequest } from "./globalTypes";

const catchAsync: any = (fn: any) => {
    return (req: IRequest, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};

export default catchAsync;
