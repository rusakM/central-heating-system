const express = require("express");

const errorHandler = require("./controllers/errorController");
const router = require("./routes/router");

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

app.use("/", router);

app.use(errorHandler);

module.exports = app;
