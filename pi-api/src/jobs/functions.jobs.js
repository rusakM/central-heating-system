const rpio = require("rpio");
const { changeRelay, writeTemperature } = require("./onDemand.jobs");

exports.addImmediateTask = (task) => {
	global.immediateTasks.push(task);
}


exports.getButtonState = (pin) => {
        const state = rpio.read(pin);
        if (state) {
                console.log("Pulled")
                this.addImmediateTask(writeTemperature);
                
        }
}
