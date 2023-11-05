const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
    {
        name: String,
        ip: String,
        active: {
            type: Boolean,
            default: true,
        },
        home: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Home",
            required: [true, "Płytka musi przynależeć do domu"],
        },
        gpioPinsOutput: {
            type: String,
            default: "38,40",
        },
        gpioPinsPullUp: {
            type: String,
            default: "37",
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

boardSchema.virtual("sensors", {
    ref: "Sensors",
    foreignField: "board",
    localField: "_id",
    match: { active: true },
});

boardSchema.pre(/^find/, function (next) {
    if (this.options._recursed) {
        return next();
    }

    this.populate({
        path: "sensors",
        select: "-__v -active",
        options: { _recursed: true },
    }).populate({
        path: "home",
        select: "-__v",
        options: { _recursed: true },
    });

    next();
});

module.exports = mongoose.model("Board", boardSchema);
