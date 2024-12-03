const mongoose = require("mongoose");
const logger = require("../controllers/loggerController");
const { dataBaseUrl } = require("../secret");

let isConnected = false; // Track connection state

const connectDatabase = async (options = {}) => {
  if (isConnected) {
    logger.log("info", "Using existing database connection");
    return;
  }
  try {
    const db = await mongoose.connect(dataBaseUrl, options);
    isConnected = db.connections[0].readyState === 1; // Check connection state
    logger.log("info", "Connected to DB successfully");
    mongoose.connection.on("error", (error) => {
      console.error("DB connect error", error);
    });
  } catch (error) {
    console.error("Could not connect to DB", error.toString());
  }
};

module.exports = connectDatabase;
