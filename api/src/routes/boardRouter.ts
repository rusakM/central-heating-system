import express, { Router } from "express";
import * as authController from "../controllers/authController";
import * as boardController from "../controllers/boardController";
import * as temperatureController from "../controllers/temperatureController";
import * as alarmController from "../controllers/alarmController";
import * as sensorController from "../controllers/sensorController";

const router: Router = express.Router();

router.use(authController.protect);
router.use(boardController.checkBoardRestrictions);

router
    .route("/:id")
    .get(boardController.getBoard)
    .patch(boardController.updateBoard);

router
    .route("/:id/alarms")
    .get(boardController.selectBoard, alarmController.getAlarms)
    .post(alarmController.createAlarm);
router
    .route("/:id/temperatures")
    .get(boardController.selectBoard, temperatureController.getTemperatures)
    .post(temperatureController.createTemperature);

router
    .route("/:id/sensors")
    .get(
        boardController.selectBoard,
        sensorController.selectActiveSensors,
        sensorController.getAll
    )
    .post(sensorController.createSensor);

export default router;
