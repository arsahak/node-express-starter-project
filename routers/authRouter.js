const express = require("express");
const authRouter = express.Router();
// const { validateUserRegistration } = require("../validator/auth");
// const runValidation = require("../validator");
const { userLogin, userLogout } = require("../controllers/authController");

authRouter.get("/auth/login", userLogin);
authRouter.get("/auth/logout", userLogout);

module.exports = { authRouter };
