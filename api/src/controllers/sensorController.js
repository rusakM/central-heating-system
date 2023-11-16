const Sensor = require("../models/sensorModel");
const handlerFactory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createSensor = catchAsync(async (req, res, next) => {
    const { name } = req.body;
    let sensor = await Sensor.findOne({ name });

    if (!sensor) {
        sensor = await Sensor.create(req.body);
    } else {
        sensor = await Sensor.findOneAndUpdate({ name }, { active: true });
    }

    res.status(201).json({
        status: "success",
        data: sensor,
    });
});

exports.getAll = handlerFactory.getAll(Sensor);

exports.getOne = handlerFactory.getOne(Sensor);

exports.deleteSensor = catchAsync(async (req, res, next) => {
    try {
        const { sensor } = req.body;
        const s = await Sensor.findByIdAndUpdate(sensor, { active: false });

        return res.status(200).json({
            status: "success",
            data: s,
        });
    } catch (error) {
        return next(new AppError("Nie znaleziono czujnika", 404));
    }
});

exports.selectActiveSensors = (req, res, next) => {
    req.query.active = "true";

    next();
};
