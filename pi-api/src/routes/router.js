const express = require("express");

const boardRouter = require("./boardRoutes");
const gpioRouter = require("./gpioRoutes");
const taskRouter = require("./taskRoutes");

const router = express.Router();

router.use("/tasks", taskRouter);
router.use("/gpio", gpioRouter);
router.use("/board", boardRouter);

module.exports = router;
