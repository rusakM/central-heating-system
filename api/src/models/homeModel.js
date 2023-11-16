const mongoose = require("mongoose");
const UserHome = require("./userHomeModel");

const homeSchema = new mongoose.Schema(
    {
        name: String,
        barcode: String,
        createdAt: Date,
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

homeSchema.virtual("boards", {
    ref: "Boards",
    foreignField: "home",
    localField: "_id",
    match: { active: true },
});

homeSchema.virtual("users", {
    ref: "UserHome",
    foreignField: "home",
    localField: "_id",
});

homeSchema.pre(/^find/, function (next) {
    if (this.options._recursed) {
        return next();
    }

    this.populate({
        path: "boards",
        select: "-__v -active -gpioPinsOutput -gpioPinsPullUp",
        options: { _recursed: true },
    }).populate({
        path: "users",
        select: "-__v",
        options: { _recursed: true },
    });

    next();
});

homeSchema.pre("save", function (next) {
    if (this.isNew) {
        this.createdAt = Date.now();
    }

    next();
});

module.exports = mongoose.model("Home", homeSchema);
