const express = require("express");
const authController = require("../controllers/authController");
const handlerFactory = require("../controllers/handlerFactory");
const homeController = require("../controllers/homeController");
const Home = require("../models/homeModel");

const router = express.Router();

router.use(authController.protect);

router.route("/").post(homeController.createHome);

router.post("/invite", homeController.inviteUser);

router.post("/claimHome", homeController.claimHome);

router.post("/blockUserHome", homeController.blockUserHome);

router
    .route("/:id")
    .get(handlerFactory.getOne(Home))
    .patch(handlerFactory.updateOne(Home));

module.exports = router;
