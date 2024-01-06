import express, { Router } from "express";

import * as sensorController from "../controllers/sensorController";
import * as authController from "../controllers/authController";

const router: Router = express.Router();

router.use(authController.protect);

router
    .route("/")
    .get(sensorController.selectActiveSensors, sensorController.getAll)
    .post(sensorController.createSensor);

router.route("/initialize").post(sensorController.initializeBoardSensors);

router.route("/:id").patch(sensorController.updateOne);

export default router;
