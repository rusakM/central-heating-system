import { Schema, model, Document, Query, Model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const userRoles = {
    admin: "admin",
    board: "board",
    user: "user",
};

export interface IUser {
    name?: string;
    email?: string;
    role?: string;
    active?: boolean;
    password?: string;
    passwordConfirm?: string | undefined;
    passwordChangedAt?: Date;
    passwordResetToken?: string | undefined;
    passwordResetExpires?: Date | undefined;
    correctPassword?: (
        candidatePassword: string,
        userPassword: string
    ) => Promise<boolean>;
    changedPasswordAfter?: (JWTTimestamp: number) => boolean;
    createPasswordResetToken?: () => string;
}

export interface IUserDocument extends IUser, Document {}

//interface IUserModel extends Model<IUserDocument> {}

const userSchema: Schema<IUserDocument> = new Schema(
    {
        name: {
            type: String,
            required: [true, "Podaj swoje imię"],
        },
        email: {
            type: String,
            required: [true, "Nie podano adresu email"],
            unique: true,
            lowercase: true,
            validate: [
                validator.isEmail,
                "Niepoprawny adres email, spróbuj ponownie",
            ],
        },
        role: {
            default: userRoles.user,
            type: String,
            enum: Object.keys(userRoles),
        },
        password: {
            type: String,
            required: [true, "Musisz podać hasło"],
            minlength: 8,
            select: false,
        },
        passwordConfirm: {
            type: String,
            required: [true, "Proszę, potwierdź swoje hasło"],
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
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

// this method will run before saving document in dbs
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    //hash the password
    this.password = (await bcrypt.hash(String(this.password), 10)) + "";
    //delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

// this method will run before searching in dbs, to filter out unactive users
userSchema.pre<
    Query<IUserDocument, IUserDocument, IUserDocument, IUserDocument>
>(/^find/, function (next) {
    this.model.find({ active: { $ne: false } });
    next();
});

// this method will save timestamp for changing password
userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) {
        return next();
    }
    this.passwordChangedAt = new Date(Date.now() - 1000);
    next();
});

// this method compares given password with password in db when the user wants to log in
userSchema.methods.correctPassword = async function (
    candidatePassword: string,
    userPassword: string
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// this method will check if the password was changed after generate the token
// which was sent by user, it prevents to log in with old password
userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            `${this.passwordChangedAt.getTime() / 1000}`,
            10
        );
        return JWTTimestamp < changedTimestamp;
    }
    // false means that password wasn't changed
    return false;
};

// this method generate token to change password, new token expires in 30 mins
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.passwordResetExpires = Date.now() + 30 * 60 * 1000;

    return resetToken;
};

export default model<IUserDocument>("User", userSchema);
