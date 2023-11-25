import User from "../models/userModel";
import { getAll, getOne, updateOne, deleteOne } from "./handlerFactory";

export const getAllUsers = getAll(User);
export const getUser = getOne(User);
export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);
