const express = require("express");
const authController = require("../controllers/authController");
const boardController = require("../controllers/boardController");
const temperatureController = require("../controllers/temperatureController");
const alarmController = require("../controllers/alarmController");
const sensorController = require("../controllers/sensorController");

const router = express.Router();

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
    .get(
        boardController.getBoardTemperatures,
        temperatureController.getTemperatures
    )
    .post(temperatureController.createTemperature);

router
    .route("/:id/sensors")
    .get(
        boardController.selectBoard,
        sensorController.selectActiveSensors,
        sensorController.getAll
    )
    .post(sensorController.createSensor);

module.exports = router;
