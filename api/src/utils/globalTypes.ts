import { Request } from "express";
import { IBoard } from "../models/boardModel";
import { IUser } from "../models/userModel";

export interface IDB {
    id?: string;
    _id?: string;
}

interface IDBUser extends IUser, IDB {}

export interface IRequest extends Request {
    requestTime?: number | string;
    user?: IDBUser;
    board?: IBoard;
}
