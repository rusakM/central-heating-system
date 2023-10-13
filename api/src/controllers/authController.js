const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
    });

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    };

    user.password = undefined;

    res.cookie("jwt", token, cookieOptions).status(statusCode).json({
        status: "success",
        token,
        tokenExpires: cookieOptions.expires.getTime(),
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Nie podano adresu email lub hasła.", 400));
    }
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Niepoprawny email lub hasło.", 401));
    }
    createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
    res.cookie("jwt", "logedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    })
        .status(200)
        .json({
            status: "success",
        });
};

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError("Najpierw należy się zalogować.", 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(
            new AppError("Niepoprawny token. Zaloguj się jeszcze raz.", 401)
        );
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                "Hasło zostało zmienione od ostatniego logowania. Zaloguj się ponownie.",
                401
            )
        );
    }

    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});
