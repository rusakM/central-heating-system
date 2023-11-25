import Alarm from "../models/alarmModel";
import * as handlerFactory from "./handlerFactory";

export const createAlarm = handlerFactory.createOne(Alarm);

export const getAlarms = handlerFactory.getAll(Alarm);
