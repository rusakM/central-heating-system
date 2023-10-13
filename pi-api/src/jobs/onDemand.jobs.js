const rpio = require("rpio");
const ds18b20 = require("ds18b20");
const { getSensors, readTemperature, writeLCD, writePorts } = require("../utils/rpioUtils");

exports.hello = function () {
  const d = new Date();
  console.log("task ok at: ", d.toTimeString());
};

exports.changeRelay = async () => {
	const rpioOutputPorts = process.env.RPIO_OUTPUT_PORTS.split(",").map(item => parseInt(item))
	let state = 0;
	console.log(global.relayNo)
	if (global.relayNo < rpioOutputPorts.length) {
		for (let i = 0; i < rpioOutputPorts.length; i++) {
			if (i === global.relayNo) {
				state = rpio.HIGH;
			} else {
				state = rpio.LOW;
			}
			console.log("Here", rpioOutputPorts[i])
			rpio.write(rpioOutputPorts[i], state);
		}
		global.relayNo++;
	} else {
		for (const pin of rpioOutputPorts) {
			rpio.write(pin, rpio.LOW);
		}
		global.relayNo = 0;
	}


}

exports.writeTemperature = async () => {
	const sensors = await getSensors();
	const temperature = await readTemperature(sensors[global.sensorNo]);
	await writeLCD(`${global.sensorsMap[sensors[global.sensorNo]].name}:`, `${temperature}C`);

	global.sensorNo = global.sensorNo < sensors.length - 1 ? global.sensorNo + 1 : 0;
	

}

exports.writeTemperature = async () => {
	const sensors = await getSensors();
	const temperature = await readTemperature(sensors[global.sensorNo]);
	await writeLCD(`${global.sensorsMap[sensors[global.sensorNo]].name}:`, `${temperature}C`);

	global.sensorNo = global.sensorNo < sensors.length - 1 ? global.sensorNo + 1 : 0;
	

}

exports.refreshTemperature = async () => {
	const sensors = await getSensors();
	const temperature = await readTemperature(sensors[global.sensorNo]);
	let temp = temperature;

	await writeLCD(`${global.sensorsMap[sensors[global.sensorNo]].name}:`, `${temperature}C`);

	if (global.sensorNo !== 0) {
		temp = await readTemperature(sensors[0]);
	}
	
	if (temp >= 35) {

		writePorts(global.rpioOutputPorts , rpio.HIGH);	
	} else {
		writePorts(global.rpioOutputPorts , rpio.LOW);
	}
}

