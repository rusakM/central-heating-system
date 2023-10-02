const dotenv = require("dotenv");
const rpio = require("rpio");
const app = require("./app");
const Queue = require("./utils/queue");
const runners = require("./jobs/runners");
const rpioUtils = require("./utils/rpioUtils");

dotenv.config();

process.on("uncaughtException", (err) => {
  console.log("Uncaught exception! Shutting down...");
  process.exit(1);
});

const port = process.env.PORT || 3000; 

//configure rpio ports
const rpioPorts = process.env.RPIO_PORTS.split(",").map(item => parseInt(item));
rpioUtils.openPorts(rpioPorts);


const server = app.listen(port, () => {
  console.log(`App is running on ${port}...`);
});

global.immediateTasks = new Queue();
//runners.immediateTasksRunner.running();



process.on("unhandledRejection", (err) => {
  console.log("Unhandled rejection. Shutting down...");
  rpioUtils.closePorts(rpioPorts);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  rpioUtils.closePorts(rpioPorts);
  server.close(() => {
    console.log("Process terminated");
  });
});
