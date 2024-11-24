const express = require("express");
const userRouter = express.Router();

const {
  getAllUsers,
  getUserById,
  deleteUserById,
  processRegister,
  activateUserAccount,
  updateUserById,
} = require("../controllers/usersController");
const { validateUserRegistration } = require("../validator/auth");
const runValidation = require("../validator");
const { isLoggedIn, isAdmin } = require("../middleware/auth");

userRouter.get("/users", isLoggedIn, isAdmin, getAllUsers);
userRouter.get("/user/:id", getUserById);
userRouter.post(
  "/user/register",
  validateUserRegistration,
  runValidation,
  processRegister
);
userRouter.post("/user/verify", activateUserAccount);
userRouter.delete("/user/:id", deleteUserById);
userRouter.put("/user/:id", updateUserById);

module.exports = { userRouter };
