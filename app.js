const express = require("express");

const app = express();

// Importing AppError and Middlwares
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controllers/errorHandler");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const helmet = require("helmet");

// Using Middlewares
app.use(express.json());
app.use(mongoSanitize());
app.use(xssClean());
app.use(cors());
app.use(helmet());

// Importing Routes
const userRouter = require("./routes/userRoute");
const teamRouter = require("./routes/teamRoute");
const taskRouter = require("./routes/taskRoute");
const notificationRouter = require("./routes/notificationRoute");

// Using Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/teams", teamRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/nots", notificationRouter);

// Implementd Route for non-existence URL
app.all("*", (req, res, next) =>
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
);

app.use(globalErrorHandler);

module.exports = app;
