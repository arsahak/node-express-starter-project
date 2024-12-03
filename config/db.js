const mongoose = require("mongoose");
const logger = require("../controllers/loggerController");
const { dataBaseUrl } = require("../secret");


mongoose
  .connect(dataBaseUrl)
  .then(() => {
    console.log('mongodb atlas is connected');
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
