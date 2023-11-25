import express, { Router } from "express";
import * as authController from "../controllers/authController";
import * as handlerFactory from "../controllers/handlerFactory";
import * as homeController from "../controllers/homeController";
import Home from "../models/homeModel";

const router: Router = express.Router();

router.use(authController.protect);

router.route("/").post(homeController.createHome);

router.post("/invite", homeController.inviteUser);

router.post("/claimHome", homeController.claimHome);

router.post("/blockUserHome", homeController.blockUserHome);

router
    .route("/:id")
    .get(handlerFactory.getOne(Home))
    .patch(handlerFactory.updateOne(Home));

export default router;
