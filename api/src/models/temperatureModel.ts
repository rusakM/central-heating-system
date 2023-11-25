import { Schema, model, Document } from "mongoose";
import { IBoard } from "./boardModel";
import { ISensor } from "./sensorModel";

export interface ITemperature extends Document {
    id?: Schema.Types.ObjectId | string;
    _id?: Schema.Types.ObjectId | string;
    board?: IBoard | Schema.Types.ObjectId;
    sensor?: ISensor | Schema.Types.ObjectId;
    temperature?: number;
    createdAt?: Date;
    measureType?: number;
}

const temperatureSchema: Schema = new Schema<ITemperature>(
    {
        board: {
            type: Schema.Types.ObjectId,
            ref: "Board",
        },
        sensor: {
            type: Schema.Types.ObjectId,
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

temperatureSchema.pre(/^find/, function (this: any, next) {
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

export default model<ITemperature>("Temperature", temperatureSchema);
