const mongoose = require("mongoose");

const userHomeSchema = new mongoose.Schema(
    {
        home: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Home",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        createdAt: Date,
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

userHomeSchema.pre(/^find/, function (next) {
    if (this.options._recursed) {
        return next();
    }

    this.populate({
        path: "home",
        select: "-__v",
        options: { _recursed: true },
    }).populate({
        path: "user",
        select: "-__v -active -homes",
        options: { _recursed: true },
    });

    next();
});

userHomeSchema.pre("save", function (next) {
    if (this.isNew) {
        this.createdAt = Date.now();
    }

    next();
});

module.exports = mongoose.model("UserHome", userHomeSchema);
