const express = require("express");

const errorHandler = require("./controllers/errorController");
const taskRouter = require("./routes/taskRoutes");
const gpioRouter = require("./routes/gpioRoutes");
const boardRouter = require("./routes/boardRoutes");

const app = express();

app.use(
    express.json({
        limit: "10kb",
    })
);
app.use(
    express.urlencoded({
        extended: true,
        limit: "10kb",
    })
);

// 2) ROUTES

app.use("/tasks", taskRouter);
app.use("/gpio", gpioRouter);
app.use("/board", boardRouter);

app.use(errorHandler);

module.exports = app;
