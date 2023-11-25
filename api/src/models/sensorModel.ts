import { Document, Schema, model } from "mongoose";
import { IBoard } from "./boardModel";

export interface ISensor extends Document {
    id?: Schema.Types.ObjectId | string;
    _id?: Schema.Types.ObjectId | string;
    name?: string;
    customName?: string;
    board?: IBoard | Schema.Types.ObjectId;
    active?: boolean;
}

const sensorSchema: Schema = new Schema<ISensor>(
    {
        name: String,
        customName: String,
        board: {
            type: Schema.Types.ObjectId,
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

sensorSchema.pre(/^find/, function (this: any, next) {
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

export default model<ISensor>("Sensor", sensorSchema);
