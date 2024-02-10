const ds18b20 = require("ds18b20");
const rpio = require("rpio");
const superagent = require("superagent");

const apiRoute = require("./utils/apiRoute");
const rpioUtils = require("./utils/rpioUtils");
const { logWithTime } = require("./utils/logger");
const { getButtonState } = require("./jobs/functions.jobs");

exports.SetRpioConfig = async function () {
    if (process.env.MODE === "pi_only") {
        global.configMode = process.env.MODE;
        return;
    }

    const configFromServer = await this.getBoardConfig();
    let rpioOutputPorts = [];
    let pullUpPorts = [];
    let boardId = process.env.BOARD_ID;

    if (configFromServer && configFromServer.active) {
        rpioOutputPorts = getPortsArrayFromString(
            configFromServer.gpioPinsOutput
        );
        pullUpPorts = getPortsArrayFromString(configFromServer.gpioPinsPullUp);

        boardId = configFromServer._id;
        global.homeId = configFromServer.home._id;
        global.isOnline = true;
    } else {
        rpioOutputPorts = getPortsArrayFromString(
            process.env.RPIO_OUTPUT_PORTS
        );
        pullUpPorts = getPortsArrayFromString(process.env.RPIO_PULLUP_PORTS);
    }

    global.rpioOutputPorts = rpioOutputPorts;
    global.pullUpPorts = pullUpPorts;
    global.boardId = boardId;

    //open ports
    rpioUtils.openPorts(rpioOutputPorts, rpio.OUTPUT, rpio.LOW);
    rpioUtils.openPorts(pullUpPorts, rpio.INPUT, rpio.PULL_UP);

    //bind button listener
    global.relayNo = 0;
    global.sensorNo = 0;
    rpio.poll(pullUpPorts[0], getButtonState);

    initializeSensors();

    global.configSuccess = true;
};

exports.getBoardConfig = async () => {
    logWithTime("Board config start...");
    logWithTime("Login to API start...");

    const token = await this.signInApi();
    global.token = token;
    if (!token) {
        return null;
    }
    logWithTime("Fetching config start...");
    const config = (
        await superagent
            .get(apiRoute().board.getBoard)
            .set("Authorization", `Bearer ${token}`)
            .set("accept", "json")
    )?.body?.data;

    if (!config) {
        console.log("Fetching config error...");
        return null;
    }

    logWithTime("Fetching config successful...");
    console.log("Config:\n", config);

    return config;
};

exports.signInApi = async () => {
    console.log({
        email: process.env.USER_EMAIL,
        password: process.env.USER_PASSWORD,
    });
    const token = (
        await superagent
            .post(apiRoute().users.login)
            .send({
                email: process.env.USER_EMAIL,
                password: process.env.USER_PASSWORD,
            })
            .set("accept", "json")
    )?.body?.token;

    if (!token) {
        logWithTime("Login error...");
        return null;
    }
    logWithTime("Login successful...");
    return token;
};

function getPortsArrayFromString(ports) {
    return ports.split(",").map((item) => parseInt(item));
}

function createSensorsMap(sensors) {
    const sensorsMap = {};

    for (const sensor of sensors) {
        sensorsMap[sensor.name] = {
            name: sensor?.customName || sensor.name,
        };
    }

    return sensorsMap;
}

async function initializeSensors() {
    await ds18b20.sensors(async (err, ids) => {
        if (err) {
            throw "Thermal sensors not found!";
        }
        console.log(`Found ${ids.length} sensors: ${ids.join(", ")}`);

        if (!global.isOnline) {
            global.sensorsMap = initializeSensorsOffline(ids);
        } else {
            const sensors = await initializeSensorsInApi(ids);
            global.sensorsMap = sensors
                ? createSensorsMap(sensors)
                : initializeSensorsOffline(ids);
        }
    });
}

function initializeSensorsOffline(sensorsList) {
    const envConfigMap = JSON.parse(process.env.RPIO_SENSORS_MAP);
    const sensorsMap = {};
    for (let i = 0; i < sensorsList.length; i++) {
        const sensor = sensorsList[i];
        if (envConfigMap[sensor]) {
            sensorsMap[sensor] = envConfigMap[sensor];
        } else {
            sensorsMap[sensor] = {
                name: `Sensor${i}}`,
            };
        }
    }

    return sensorsMap;
}

async function initializeSensorsInApi(sensorsList) {
    const sensors = (
        await superagent
            .post(apiRoute().sensors.initialize)
            .send({ sensors: sensorsList })
            .set("Authorization", `Bearer ${global.token}`)
            .set("accept", "json")
    )?.body?.data;

    if (!sensors) {
        return null;
    }

    return sensors;
}
