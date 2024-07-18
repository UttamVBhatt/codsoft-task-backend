const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

process.on("uncaughtException", (err) => {
  console.log(err, err.message, err.stack);
  console.log("Uncaught Exception Shutting Down.....");
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const port = process.env.PORT;
const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    dbName: "TaskManager",
  })
  .then(() => console.log("Database is connected"))
  .catch((err) => console.log(err));

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection Shutting Down...");
  console.log(err.message, err, err.stack);
  server.close(() => {
    process.exit(1);
  });
});
