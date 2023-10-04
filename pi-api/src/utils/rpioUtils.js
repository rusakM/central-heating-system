const rpio = require("rpio");
const { addImmediateTask, changeRelay } = require("../jobs/onDemand.jobs");

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
}

exports.getButtonState = (pin) => {
	const state = rpio.read(pin);
	if (state) {
		console.log("Pulled")
		addImmediateTask(changeRelay);
	} 
}
