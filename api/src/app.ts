import express, { Express, Request, Response, NextFunction } from "express";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import * as helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import morgan from "morgan";
import path from "path";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import bodyParser from "body-parser";

import errorHandler from "./controllers/errorController";
import routes from "./routes/globalRoutes";
import { IRequest } from "./utils/globalTypes";

const app: Express = express();

// 1) global middlewares

//use cors
app.use((req: Request, res: Response, next: NextFunction) => {
    next();
}, cors());

//use parameter pollution protection
app.use(hpp());

app.options(
    "*",
    (req: Request, res: Response, next: NextFunction) => {
        next();
    },
    cors()
);

//development logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

//set security http headers
app.use(helmet.default());

//limit requests from the same ip
const limiter: RateLimitRequestHandler = rateLimit({
    max: 200,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again later",
});
app.use("/api", limiter);

app.use(
    express.json({
        limit: "10mb",
    })
);
app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
    })
);
app.use(cookieParser());

// data sanitization against nosql query injection
app.use(mongoSanitize());

//use compression data
app.use(compression());

//add request time to req
app.use((req: IRequest, res: Response, next: NextFunction) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 2) ROUTES

app.get("/", (req: IRequest, res: Response, next: NextFunction) => {
    res.status(200).json({
        status: "success",
    });
});

app.use("/api", routes);

app.use(errorHandler);

export default app;
