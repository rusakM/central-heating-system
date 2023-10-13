const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app");

dotenv.config();

process.on("uncaughtException", (err) => {
    console.log("Uncaught exception! Shutting down...");
    process.exit(1);
});

const dbPassword = process.env.DATABASE_PASSWORD;
const dbUser = process.env.DATABASE_USER;
const dbName = process.env.DATABASE_NAME;

const DB = process.env.DATABASE.replace("<password>", dbPassword)
    .replace("<username>", dbUser)
    .replace("<database>", dbName);

mongoose.connect(DB);

const dbConnection = mongoose.connection;
dbConnection.once("open", () => console.log("connection with db OK!"));
dbConnection.on("error", (err) => console.error(err));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App is running on ${port}...`);
});

// const io = new Socket.Server(server, {
//   cors: { origin: "*" },
// });

// app.set("io", io);

process.on("unhandledRejection", (err) => {
    console.log("Unhandles rejection. Shutting down...");
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
