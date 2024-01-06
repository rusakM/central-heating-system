import { Document, Schema, model } from "mongoose";
import { ISensor } from "./sensorModel";
import { IHome } from "./homeModel";

interface IBoardSchema extends Document {
    id?: Schema.Types.ObjectId | string;
    _id?: Schema.Types.ObjectId | string;
    name?: string;
    ip?: string;
    active?: boolean;
    home?: IHome | Schema.Types.ObjectId;
    gpioPinsOutput?: string;
    gpioPinsPullUp?: string;
}

export interface IBoard extends IBoardSchema {
    sensors?: ISensor[] | Schema.Types.ObjectId[];
}

const boardSchema: Schema = new Schema<IBoardSchema>(
    {
        name: String,
        ip: String,
        active: {
            type: Boolean,
            default: true,
        },
        home: {
            type: Schema.Types.ObjectId,
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
    ref: "Sensor",
    foreignField: "board",
    localField: "_id",
    match: { active: true },
});

boardSchema.pre(/^find/, function (this: any, next) {
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

export default model<IBoardSchema>("Board", boardSchema);
