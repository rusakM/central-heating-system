import express, { Router } from "express";
import * as authController from "../controllers/authController";
import * as boardController from "../controllers/boardController";
import alarmRouter from "./alarmRouter";
import sensorRouter from "./sensorRouter";
import temperatureRouter from "./temperatureRouter";

const router: Router = express.Router();

router.use(authController.protect);

router
    .route("/:id")
    .get(boardController.checkBoardRestrictions, boardController.getBoard)
    .patch(boardController.checkBoardRestrictions, boardController.updateBoard);

router.use(
    "/:id/alarms",
    boardController.checkBoardRestrictions,
    boardController.selectBoard,
    alarmRouter
);

router.get("/:id/ping", boardController.ping);

router.use(
    "/:id/temperature",
    boardController.checkBoardRestrictions,
    boardController.selectBoard,
    temperatureRouter
);

router.use(
    "/:id/sensors",
    boardController.checkBoardRestrictions,
    boardController.selectBoard,
    sensorRouter
);

export default router;
