import { Router } from "express";
import * as temperatureController from "../controllers/temperatureController";
import * as globalMiddlewares from "../middlewares/global";

const router: Router = Router();

router
    .route("/")
    .get(
        globalMiddlewares.getLatest("createdAt"),
        globalMiddlewares.limit("10"),
        temperatureController.getTemperatures
    )
    .post(temperatureController.createTemperature);

export default router;
