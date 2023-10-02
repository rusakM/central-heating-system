const rpio = require("rpio");

exports.openPorts = (ports) => {
	for (const port of ports) {
		rpio.open(port, rpio.OUTPUT, rpio.LOW);
	}
}

exports.closePorts = (ports) => {
	for (const port of ports) {
		rpio.close(port);
	}
}