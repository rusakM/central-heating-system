const dotenv = require("dotenv");
const rpio = require("rpio");
const ds18b20 = require("ds18b20");
const util = require("util");
const app = require("./app");
const Queue = require("./utils/queue");
const runners = require("./jobs/runners");
const { getButtonState } = require("./jobs/functions.jobs");
const rpioUtils = require("./utils/rpioUtils");

dotenv.config();

//process.on("uncaughtException", (err) => {
//  console.log("Uncaught exception! Shutting down...");
//  process.exit(1);
//});

const port = process.env.PORT || 3000; 

//read sensors map
global.sensorsMap = JSON.parse(process.env.RPIO_SENSORS_MAP);
console.log(sensorsMap);

//configure rpio ports
const rpioOutputPorts = process.env.RPIO_OUTPUT_PORTS.split(",").map(item => parseInt(item));
const pullUpPorts = process.env.RPIO_PULLUP_PORTS.split(",").map(item => parseInt(item));
global.rpioOutputPorts = rpioOutputPorts;
global.pullUpPorts = pullUpPorts;

// open ports
rpioUtils.openPorts(rpioOutputPorts, rpio.OUTPUT, rpio.LOW);
rpioUtils.openPorts(pullUpPorts, rpio.INPUT, rpio.PULL_UP);

console.log(`Opened ${rpioOutputPorts.length} as OUTPUT GPIO ports: ${process.env.RPIO_OUTPUT_PORTS}`);
console.log(`Opened ${pullUpPorts.length} as PULLUP GPIO ports: ${process.env.RPIO_PULLUP_PORTS}`);

// bind button listener

global.relayNo = 0;
global.sensorNo = 0;
rpio.poll(pullUpPorts[0], getButtonState);


try {
	ds18b20.sensors((err, ids) => {
		if (err) {
			throw "Thermal sensors not found!";		
		}
		
		console.log(`Found ${ids.length} sensors: ${ids.join(", ")}`);
	})
} catch (error) {
	console.log(error);
};


const server = app.listen(port, () => {
  console.log(`App is running on ${port}...`);
});

global.immediateTasks = new Queue();
runners.immediateTasksRunner.trigger();
runners.LCDRunner.trigger();



process.on("unhandledRejection", (err) => {
  console.log("Unhandled rejection. Shutting down...");
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
