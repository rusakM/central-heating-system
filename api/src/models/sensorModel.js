const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema(
    {
        name: String,
        customName: String,
        board: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Board",
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

sensorSchema.pre(/^find/, function (next) {
    if (this.options._recursed) {
        return next();
    }

    this.populate({
        path: "board",
        select: "-__v -active -sensors -gpioPinsOutput -gpioPinsPullUp",
        options: { _recursed: true },
    });

    next();
});

module.exports = mongoose.model("Sensor", sensorSchema);
