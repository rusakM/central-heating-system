const mongoose = require("mongoose");

const temperatureSchema = new mongoose.Schema(
    {
        board: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Board",
        },
        sensor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Sensor",
        },
        temperature: Number,
        createdAt: {
            type: Date,
        },
        measureType: Number,
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

temperatureSchema.pre(/^find/, function (next) {
    if (this.options._recursed) {
        return next();
    }

    this.populate({
        path: "board",
        select: "-__v -active -sensors -gpioPinsOutput -gpioPinsPullUp -ip",
        options: { _recursed: true },
    }).populate({
        path: "sensor",
        select: "-__v -board -active",
        options: { _recursed: true },
    });

    next();
});

module.exports = mongoose.model("Temperature", temperatureSchema);
