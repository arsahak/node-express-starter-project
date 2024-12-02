const mongoose = require("mongoose");
const logger = require("../controllers/loggerController");
const { dataBaseUrl } = require("../secret");
require("dotenv").config();

// const connectDatabase = async (options = {}) => {
//   try {
//     await mongoose.connect( process.env.DB_URL, options);
//     console.log("connect to DB is successfully established");
//     // logger.log("info", "connect to DB is successfully established")

//     mongoose.connection.on("error", (error) => {
//       console.error("DB connect error", error);
//     });
//   } catch (error) {
//     console.error("could not connect to DB", error.toString());
//   }
// };

// module.exports = connectDatabase;

// const mongoose = require('mongoose');


mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log('mongodb atlas is connected');
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

