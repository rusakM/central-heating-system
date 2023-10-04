const rpio = require("rpio");
const ds18b20 = require("ds18b20");

exports.hello = function () {
  const d = new Date();
  console.log("task ok at: ", d.toTimeString());
};

exports.addImmediateTask = (task) => {
	global.immediateTasks.push(task);
}

exports.changeRelay = () => {
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

exports.readTemperature = async (pin) => {
	
}


