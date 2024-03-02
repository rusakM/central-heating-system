const rpio = require("rpio");

const jobWrapper = require("./jobWrapper");
const {
  getSensors,
  readTemperature,
  writeLCD,
  writePorts,
} = require("../utils/rpioUtils");

exports.hello = function () {
  const d = new Date();
  console.log("task ok at: ", d.toTimeString());
};

exports.changeRelay = jobWrapper(async () => {
  const rpioOutputPorts = global?.outputPorts;

  if (!rpioOutputPorts) {
    global.relayNo = 0;
    return;
  }
  let state = 0;
  console.log(global.relayNo);
  if (global.relayNo < rpioOutputPorts.length) {
    for (let i = 0; i < rpioOutputPorts.length; i++) {
      if (i === global.relayNo) {
        state = rpio.HIGH;
      } else {
        state = rpio.LOW;
      }
      console.log("Here", rpioOutputPorts[i]);
      rpio.write(rpioOutputPorts[i], state);
    }
    global.relayNo++;
  } else {
    for (const pin of rpioOutputPorts) {
      rpio.write(pin, rpio.LOW);
    }
    global.relayNo = 0;
  }
});

exports.writeTemperature = jobWrapper(async () => {
	if (!global.configSuccess) {
		return;	
	}
  if (!typeof global?.sensorNo === 'number' || global.sensorNo < 0) {
    return;
  }
  let sensors = global.sensorsArray;

  if (!sensors) {
    sensors = await getSensors();
  }
  const currentSensor = sensors[global.sensorNo];
  const temperature = await readTemperature(currentSensor);
  writeLCD(
    `${global.sensorsMap[currentSensor].name}:`,
    `${temperature}C`
  );

  global.sensorNo =
    global.sensorNo < sensors.length - 1 ? global.sensorNo + 1 : 0;

});

exports.refreshTemperature = jobWrapper(async () => {
  const sensors = await getSensors();
  const temperature = await readTemperature(sensors[global.sensorNo]);
  let temp = temperature;

  await writeLCD(
    `${global.sensorsMap[sensors[global.sensorNo]].name}:`,
    `${temperature}C`
  );

  if (global.sensorNo !== 0) {
    temp = await readTemperature(sensors[0]);
  }

  if (temp >= 35) {
    writePorts(global.rpioOutputPorts, rpio.HIGH);
  } else {
    writePorts(global.rpioOutputPorts, rpio.LOW);
  }
});
