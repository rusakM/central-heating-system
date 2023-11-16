const Home = require("../models/homeModel");
const UserHome = require("../models/userHomeModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const handlerFactory = require("./handlerFactory");

exports.createHome = catchAsync(async (req, res, next) => {
    if (req.user) {
        return next(new AppError("Najpierw należy się zalogować", 401));
    }

    let home = await Home.create(req.body);

    if (!home) {
        return next(new AppError("Nie można utworzyć", 404));
    }

    home = home.toJSON();

    let userHome = await UserHome.create({
        home: home._id,
        user: req.user._id,
    });

    res.status(200).json({
        status: "success",
        data: {
            home,
            userHome,
        },
    });
});

exports.inviteUser = catchAsync(async (req, res, next) => {
    const { user, home } = req.body;

    if ((await User.findById(user)) && (await Home.findById(home))) {
        return res.status(200).json({
            status: "success",
            data: {
                ...req.body,
                homeOwner: req.user._id,
            },
        });
    }

    next(new AppError("Nie można zaprosić użytkownika", 404));
});

exports.claimHome = catchAsync(async (req, res, next) => {
    const { user, home } = req.body;

    let userHome = await UserHome.findOne({ user, home });

    if (userHome) {
        if (!userHome.active) {
            userHome = await UserHome.findByIdAndUpdate(userHome._id, {
                active: true,
            });
        } else {
            return next(
                new AppError(
                    "Podany użytkownik już jest przypisany do domu",
                    404
                )
            );
        }
    } else {
        userHome = await UserHome.create({ user, home });
    }

    res.status(200).json({
        status: "success",
        data: {
            ...userHome,
        },
    });
});

exports.blockUserHome = catchAsync(async (req, res, next) => {
    const { user, home } = req.body;

    if (await User.findOneAndUpdate({ user, home }, { active: false })) {
        return res.status(200).json({
            status: "success",
            data: {
                user,
                home,
                active: false,
            },
        });
    }

    next(new AppError("Nie można zablokować użytkownika", 404));
});
