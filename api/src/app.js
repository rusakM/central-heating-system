const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");

const errorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRouter");

const app = express();

// 1) global middlewares

//use cors
app.use((req, res, next) => {
    next();
}, cors());

//use parameter pollution protection
app.use(hpp());

app.options(
    "*",
    (req, res, next) => {
        next();
    },
    cors()
);

//development logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

//set security http headers
app.use(helmet());

//limit requests from the same ip
const limiter = rateLimit({
    max: 200,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again later",
});
app.use("/api", limiter);

app.use(cookieParser());

// data sanitization against nosql query injection
app.use(mongoSanitize());

//data sanitization agains XSS
app.use(xss());

//use compression data
app.use(compression());

//add request time to req
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 2) ROUTES

app.get("/", (req, res, next) => {
    res.status(200).json({
        status: "success",
    });
});

app.use("/api/users", userRouter);

app.use(errorHandler);

module.exports = app;
