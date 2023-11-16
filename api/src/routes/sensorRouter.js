const express = require("express");

const sensorController = require("../controllers/sensorController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.route("/").post(sensorController.createSensor);

module.exports = router;
