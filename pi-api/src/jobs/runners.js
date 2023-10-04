const cron = require("croner");
const programmedJobs = require("./programmed.jobs");
const jobs = require("./onDemand.jobs");



exports.immediateTasksRunner = cron(
  "*/1 * * * * *",
  programmedJobs.immediateTasks
);


