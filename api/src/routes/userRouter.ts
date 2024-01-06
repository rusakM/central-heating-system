import express, { Router } from "express";
import * as userController from "../controllers/userController";
import * as authController from "../controllers/authController";

const router: Router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/me", authController.protect, userController.getMe);

export default router;
