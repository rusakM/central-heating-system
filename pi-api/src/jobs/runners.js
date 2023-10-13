const cron = require("croner");
const { immediateTasks } = require("./programmed.jobs");
const jobs = require("./onDemand.jobs");



exports.immediateTasksRunner = cron(
  "*/1 * * * * *",
  immediateTasks
);

exports.LCDRunner = cron(
	"*/10 * * * * *",
	jobs.refreshTemperature
);
