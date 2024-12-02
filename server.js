const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const xssClean = require("xss-clean");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const connectDatabase = require("./config/db");
const { serverPort } = require("./secret");
const { userRouter } = require("./routers/userRouter");
const { seedRouter } = require("./routers/seedRouter");
const { authRouter } = require("./routers/authRouter");
const { errorResponse } = require("./controllers/responseController");

// Initialize Express App
const app = express();

// Database Connection
(async () => {
  try {
    await connectDatabase();
    console.log("Connected to the database.");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1); // Exit process with failure
  }
})();

// Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(cookieParser());
app.use(limiter);
app.use(xssClean());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api", authRouter);
app.use("/api/seed", seedRouter);
app.use("/api", userRouter);

app.get("/", (req, res) => {
  return res.status(200).json({ success: "response from get api" });
});

// Client Error Handling
app.use((req, res, next) => {
  next(createError(404, "Route not found"));
});

// Server Error Handling
app.use((err, req, res, next) => {
  return errorResponse(res, { statusCode: err.status || 500, message: err.message || "Internal Server Error" });
});

// Start Server
app.listen(serverPort, () => {
  console.log(`Server is running at http://localhost:${serverPort}`);
});


