import express, { Router } from "express";

import * as sensorController from "../controllers/sensorController";
import * as authController from "../controllers/authController";

const router: Router = express.Router();

router.use(authController.protect);

router.route("/").post(sensorController.createSensor);

export default router;
