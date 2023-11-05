const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema(
    {
        actionType: Number,
        board: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Board",
        },
        pinBoard: Number,
        createdAt: {
            type: Date,
        },
        status: String,
        forced: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

actionSchema.pre(/^find/, function (next) {
    if (this.options._recursed) {
        return next();
    }

    this.populate({
        path: "board",
        select: "-__v -active -sensors -gpioPinsOutput -gpioPinsPullUp -ip",
        options: { _recursed: true },
    });

    next();
});

module.exports = mongoose.model("Action", actionSchema);
