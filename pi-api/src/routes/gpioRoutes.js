const express = require("express");
const gpioController = require("../controllers/gpioController");
const utilsController = require("../controllers/utilsController");


const router = express.Router();

router.get(
  "/sensors",
  utilsController.addRequestTimestamp,
  gpioController.getTemperature
);


router.get(
	"/ports", 
	utilsController.addRequestTimestamp,
	gpioController.togglePort
);

module.exports = router;
