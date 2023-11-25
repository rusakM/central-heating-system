import { Document, Schema, model } from "mongoose";
import { IBoard } from "./boardModel";
import { ITemperature } from "./temperatureModel";

export interface IAlarm extends Document {
    id?: Schema.Types.ObjectId | string;
    _id?: Schema.Types.ObjectId | string;
    board: IBoard | Schema.Types.ObjectId;
    temperature: ITemperature | Schema.Types.ObjectId;
    createdAt: Date;
}

const alarmSchema: Schema = new Schema<IAlarm>(
    {
        board: {
            type: Schema.Types.ObjectId,
            ref: "Board",
        },
        temperature: {
            type: Schema.Types.ObjectId,
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

alarmSchema.pre(/^find/, function (this: any, next) {
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

export default model<IAlarm>("Alarm", alarmSchema);
