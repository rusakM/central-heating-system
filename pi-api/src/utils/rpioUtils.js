const rpio = require("rpio");
const ds18b20 = require("ds18b20");
const { exec } = require("child_process");
const util = require("util");

exports.openPorts = (ports, mode, init) => {
//	console.log("rpio low", mode);
	for (const port of ports) {
		rpio.open(port, mode, init);
	}
}

exports.closePorts = (ports) => {
	for (const port of ports) {
		rpio.close(port);
	}
	rpio.exit();
}

exports.writePorts = (ports, value) => {
	for (const port of ports) {
		if (rpio.read(port) !== value) {
			rpio.write(port, value);
		}
	}
}

exports.getSensors = util.promisify(ds18b20.sensors);

const temperatureReader = util.promisify(ds18b20.temperature);

exports.readTemperature = async (sensor) => {
	return await temperatureReader(sensor);
}

exports.writeLCD = async (first, second) => {
	const cmd = util.promisify(exec);

	await cmd(`python3 LCD.py "${first}" "${second}"`);

}

