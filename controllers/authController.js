const mongoose = require("mongoose");
const createError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { successResponse } = require("./responseController");
const createJsonWebToken = require("../helper/jsonWebToken");
const { jwtSecretKey, clientUrl } = require("../secret");

const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw createError(
        404,
        "User does not exist with this email, Please register first"
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw createError(404, "Email/Password did not match");
    }

    if (user.isBanned) {
      throw createError(403, "You are banned please contact with authority");
    }

    const jwtToken = await createJsonWebToken({ user }, jwtSecretKey, {
      expiresIn: "10m",
    });

    res.cookie("access_token", jwtToken, {
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      // secure: true,
      sameSite: "none",
    });

    return successResponse(res, {
      statusCode: 201,
      message: "User login successfully ",
      payload: { user },
    });
  } catch (error) {
    next(error);
  }
};

const userLogout = async (req, res, next) => {
  try {
    res.clearCookie("access_token");

    return successResponse(res, {
      statusCode: 201,
      message: "User logout successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  userLogin,
  userLogout,
};
