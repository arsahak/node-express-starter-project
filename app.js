// const express = require("express");
// const morgan = require("morgan");
// const cors = require('cors')
// const bodyParser = require("body-parser");
// const createError = require("http-errors");
// const xssClean = require("xss-clean");
// const cookieParser = require("cookie-parser");
// const rateLimit = require("express-rate-limit");
// const { userRouter } = require("./routers/userRouter");
// const { seedRouter } = require("./routers/seedRouter");
// const { authRouter } = require("./routers/authRouter");
// const { errorResponse } = require("./controllers/responseController");

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   limit: 100,
//   message: "Too many reqeust from this ip please try later",
//   // standardHeaders: "draft-7",
//   // legacyHeaders: false,
// });

// const app = express();

// app.use(cookieParser());
// app.use(limiter);
// app.use(cors())
// app.use(xssClean());
// app.use(morgan("dev"));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));


const express = require("express");
const createError = require("http-errors");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const { seedRouter } = require("./routers/seedRouter");


app.use(
  cors({
    origin: ["https://eshop-tutorial-pyri.vercel.app", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/test", (req, res) => {
  res.send("Hello world!");
});

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));


// app.use("/api", authRouter);
app.use("/api/seed", seedRouter);
// app.use("/api", userRouter);


app.get("/", (req, res) => {
  return res.status(201).json({success: true, message:"welcome to the server"});
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
