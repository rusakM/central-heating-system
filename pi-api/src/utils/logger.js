const timeUtils = require("./timeUtils");

exports.logWithTime = (message) =>
    console.log(`${timeUtils.getTimeNow()} - ${message}`);
