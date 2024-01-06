import { Router } from "express";
import * as alarmController from "../controllers/alarmController";
import * as globalMiddlewares from "../middlewares/global";

const router: Router = Router();

router
    .route("/")
    .get(
        globalMiddlewares.getLatest("createdAt"),
        globalMiddlewares.limit("10"),
        alarmController.getAlarms
    )
    .post(alarmController.createAlarm);

router.get("/all", alarmController.getAlarms);

export default router;
