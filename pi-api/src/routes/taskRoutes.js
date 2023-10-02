const express = require("express");
const taskController = require("../controllers/taskController");
const onDemandJobs = require("../jobs/onDemand.jobs");

const router = express.Router();

router.get(
  "/hello",
  taskController.addImmediateTask(onDemandJobs.hello),
  taskController.sendSuccessResponse
);


module.exports = router;
