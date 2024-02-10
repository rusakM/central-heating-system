const dotenv = require("dotenv");
const app = require("./app");
const config = require("./config");
const Queue = require("./utils/queue");
const runners = require("./jobs/runners");
const rpioUtils = require("./utils/rpioUtils");

dotenv.config();

process.on("uncaughtException", (err) => {
    console.log("Uncaught exception! Shutting down...");
    console.log(err);
    process.exit(1);
});

config.SetRpioConfig().catch((error) => console.log(error));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`App is running on ${port}...`);
});

global.immediateTasks = new Queue();
runners.immediateTasksRunner.trigger();
runners.LCDRunner.trigger();

process.on("unhandledRejection", (err) => {
    console.log("Unhandled rejection. Shutting down...");
    console.log(err);
    // server.close(() => {
    //     process.exit(1);
    // });
});

process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down...");
    rpioUtils.closePorts(rpioPorts);
    server.close(() => {
        console.log("Process terminated");
    });
});
