import { Document, Schema, model } from "mongoose";
import { IUserHome } from "./userHomeModel";
import { IBoard } from "./boardModel";

interface IHomeSchema extends Document {
    id?: string;
    _id?: string;
    name?: string;
    barcode?: string;
    createdAt?: string;
}

export interface IHome extends IHomeSchema {
    boards?: IBoard[] | Schema.Types.ObjectId[];
    users?: IUserHome[] | Schema.Types.ObjectId[];
}

const homeSchema: Schema = new Schema<IHomeSchema>(
    {
        name: {
            required: true,
            unique: true,
            type: String,
        },
        barcode: String,
        createdAt: Date,
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

homeSchema.virtual("boards", {
    ref: "Board",
    foreignField: "home",
    localField: "_id",
    match: { active: true },
});

homeSchema.virtual("users", {
    ref: "UserHome",
    foreignField: "home",
    localField: "_id",
});

homeSchema.pre(/^find/, function (this: any, next) {
    if (this.options._recursed) {
        return next();
    }

    this.populate({
        path: "users",
        select: "-__v",
        options: { _recursed: true },
        populate: {
            path: "user",
            select: "_id name email role active",
            options: { _recursed: true },
        },
    });
    this.populate({
        path: "boards",
        select: "-__v -active -gpioPinsOutput -gpioPinsPullUp",
        options: { _recursed: true },
    });

    next();
});

homeSchema.pre("save", function (next) {
    if (this.isNew) {
        const createdAt = Date.now();
        this.createdAt = createdAt;
        this.barcode = String(createdAt).slice(4, 12);
    }

    next();
});

export default model<IHomeSchema>("Home", homeSchema);
