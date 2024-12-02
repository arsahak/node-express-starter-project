const express = require("express");
const morgan = require("morgan");
const cors = require('cors')
const bodyParser = require("body-parser");
const createError = require("http-errors");
const xssClean = require("xss-clean");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { userRouter } = require("./routers/userRouter");
const { seedRouter } = require("./routers/seedRouter");
const { authRouter } = require("./routers/authRouter");
const { errorResponse } = require("./controllers/responseController");

const data = require("./data");
const User = require("./models/userModel");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: "Too many reqeust from this ip please try later",
  // standardHeaders: "draft-7",
  // legacyHeaders: false,
});

const app = express();

app.use(cookieParser());
app.use(limiter);
app.use(cors())
app.use(xssClean());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use("/api", authRouter);
app.use("/api/seed", seedRouter);
app.use("/api", userRouter);


app.get("/", async (req, res, next) => {
  try {
    // Clear the database
    await User.deleteMany({});

    // Insert new data
    const users = await User.insertMany(data);

    // Return the inserted users
    return res.status(200).json(users);
  } catch (error) {
    // Pass the error to the error-handling middleware
    next(error);
  }
});


//client error handling

app.use((req, res, next) => {
  next(createError(404, "route not found"));
});

//server error handling

app.use((err, req, res, next) => {
  return errorResponse(res, { statusCode: err.status, message: err.message });
});

module.exports = app;
