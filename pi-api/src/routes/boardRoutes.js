const express = require("express");
const boardController = require("../controllers/boardController");

const router = express.Router();

router.get("/ping", boardController.ping);

module.exports = router;
