const Temperature = require("../models/temperatureModel");
const handlerFactory = require("./handlerFactory");

exports.createTemperature = handlerFactory.createOne(Temperature);

exports.getTemperatures = handlerFactory.getAll(Temperature);
