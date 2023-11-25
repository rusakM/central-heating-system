import { Request } from "express";
import { IBoard } from "../models/boardModel";

export interface IRequest extends Request {
    requestTime?: number | string;
    user?: any;
    board?: IBoard;
}
