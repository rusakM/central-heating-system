const Board = require("../models/boardModel");
const Temperature = require("../models/temperatureModel");
const Alarm = require("../models/alarmModel");
const { userRoles } = require("../models/userModel");
const UserHome = require("../models/userHomeModel");
const handlerFactory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.checkBoardRestrictions = catchAsync(async (req, res, next) => {
    const { _id, role } = req.user;
    const boardId = req.params.id;

    const board = await Board.findById(boardId);

    if (!board) {
        return next(new AppError("Podana płytka nie istnieje", 404));
    }

    if (role === userRoles.user) {
        const userHome = await UserHome.findOne({
            user: _id,
            home: board.home._id,
        });

        if (!userHome) {
            return next(new AppError("Brak uprawnień do podanej płytki"));
        }
    }

    req.board = board.toJSON();

    next();
});

exports.createBoard = handlerFactory.createOne(Board);

exports.updateBoard = handlerFactory.updateOne(Board);

exports.getBoard = (req, res, next) => {
    const { board } = req;
    if (!board) {
        return next(new AppError("Podana płytka nie istnieje", 404));
    }

    res.status(200).json({
        status: "success",
        data: board,
    });
};

exports.selectBoard = (req, res, next) => {
    req.query.board = req.params.id;
    next();
};
