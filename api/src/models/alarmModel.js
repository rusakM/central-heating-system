const mongoose = require("mongoose");

const alarmSchema = new mongoose.Schema(
    {
        board: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Board",
        },
        temperature: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Temperature",
        },
        createdAt: {
            type: Date,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

alarmSchema.pre(/^find/, function (next) {
    if (this.options._recursed) {
        return next();
    }

    this.populate({
        path: "board",
        select: "-__v -active -sensors -gpioPinsOutput -gpioPinsPullUp -ip",
        options: { _recursed: true },
    }).populate({
        path: "temperature",
        select: "-__v -board",
        options: { _recursed: true },
    });

    next();
});

module.exports = mongoose.model("Alarm", alarmSchema);
