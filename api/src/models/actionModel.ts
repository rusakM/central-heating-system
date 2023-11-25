import { Schema, model, Document } from "mongoose";
import { IBoard } from "./boardModel";

export interface IAction extends Document {
    id?: Schema.Types.ObjectId | string;
    _id?: Schema.Types.ObjectId | string;
    actionType?: number;
    board?: IBoard | Schema.Types.ObjectId;
    pinBoard?: number;
    createdAt?: Date;
    status?: string;
    forced?: boolean;
}

const actionSchema: Schema = new Schema<IAction>(
    {
        actionType: Number,
        board: {
            type: Schema.Types.ObjectId,
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

actionSchema.pre(/^find/, function (this: any, next) {
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

export default model<IAction>("Action", actionSchema);
