const rpio = require("rpio");
const { changeRelay, writeTemperature, hello } = require("./onDemand.jobs");
const jobWrapper = require("./jobWrapper");

exports.addImmediateTask = (task) => {
	global.immediateTasks.push(task);
}

const fun = () => console.log('Here');

exports.getButtonState = (pin) => {
        const state = rpio.read(pin);
        if (state) {
                console.log("Pulled");
                this.addImmediateTask(writeTemperature);
                
        }
}
