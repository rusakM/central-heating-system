import * as dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";

dotenv.config();

process.on("uncaughtException", (err) => {
    console.log("Uncaught exception! Shutting down...");
    process.exit(1);
});

const dbPassword: string = String(process.env.DATABASE_PASSWORD);
const dbUser: string = String(process.env.DATABASE_USER);
const dbName: string = String(process.env.DATABASE_NAME);
const database: string = String(process.env.DATABASE);

const DB: string = database
    .replace("<password>", dbPassword)
    .replace("<username>", dbUser)
    .replace("<database>", dbName);

mongoose.connect(DB);

const dbConnection: mongoose.Connection = mongoose.connection;
dbConnection.once("open", () => console.log("connection with db OK!"));
dbConnection.on("error", (err) => console.error(err));

const port: string | number = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App is running on ${port}...`);
});

// const io = new Socket.Server(server, {
//   cors: { origin: "*" },
// });

// app.set("io", io);

process.on("unhandledRejection", (err) => {
    console.log("Unhandled rejection. Shutting down...");
    console.log(err);
    server.close(() => {
        process.exit(1);
    });
});

process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down...");
    server.close(() => {
        console.log("Process terminated");
    });
});
