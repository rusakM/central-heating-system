import Temperature from "../models/temperatureModel";
import { createOne, getAll } from "./handlerFactory";

export const createTemperature = createOne(Temperature);

export const getTemperatures = getAll(Temperature);
