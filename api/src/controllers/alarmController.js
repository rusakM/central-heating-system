const Alarm = require("../models/alarmModel");
const handlerFactory = require("./handlerFactory");

exports.createAlarm = handlerFactory.createOne(Alarm);

exports.getAlarms = handlerFactory.getAll(Alarm);
