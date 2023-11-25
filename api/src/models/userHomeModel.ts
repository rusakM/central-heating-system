import { Document, Schema, model } from "mongoose";
import { IUser } from "./userModel";
import { IHome } from "./homeModel";

export interface IUserHome extends Document {
    id?: Schema.Types.ObjectId | string;
    _id?: Schema.Types.ObjectId | string;
    home: IHome | Schema.Types.ObjectId;
    user: IUser | Schema.Types.ObjectId;
    createdAt: Date;
    active: boolean;
}

const userHomeSchema: Schema = new Schema<IUserHome>(
    {
        home: {
            type: Schema.Types.ObjectId,
            ref: "Home",
        },
        user: {
            type: Schema.Types.ObjectId,
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

userHomeSchema.pre(/^find/, function (this: any, next) {
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

export default model<IUserHome>("UserHome", userHomeSchema);
