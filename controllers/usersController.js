const mongoose = require("mongoose");
const createError = require("http-errors");
const data = require("../data");
const User = require("../models/userModel");
const { successResponse } = require("./responseController");
const { findWithId } = require("../services/findWithId");
const createJsonWebToken = require("../helper/jsonWebToken");
const { jwtSecretKey, clientUrl } = require("../secret");
const sendEmailWithNodeMailer = require("../helper/email");
const jwt = require("jsonwebtoken");
const runValidation = require("../validator");
// Get All User for Admin

const getAllUsers = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 5);

    const escapeRegExp = (string) =>
      string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safeSearch = escapeRegExp(search);

    const searchRegExp = new RegExp(`.*${safeSearch}.*`, "i");

    const filter = {
      isAdmin: { $ne: true },
      $or: [
        { name: searchRegExp },
        { email: searchRegExp },
        { phone: searchRegExp },
      ],
    };

    const options = { password: 0 };

    const users = await User.find(filter, options)
      .limit(limit)
      .skip((page - 1) * limit);

    const count = await User.find(filter).countDocuments();

    if (!users) throw createError(404, "no users found ");

    const totalPages = Math.ceil(count / limit);

    return successResponse(res, {
      statusCode: 201,
      message: "Users successfully returned",
      payload: {
        users,
        pagination: {
          totalPages,
          currentPage: page,
          previousPage: page > 1 ? page - 1 : null,
          nextPage: page < totalPages ? page + 1 : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get User by Id

const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;

    const options = { password: 0 };

    const user = await findWithId(User, id, options);

    return successResponse(res, {
      statusCode: 201,
      message: "User successfully returned",
      payload: { user },
    });
  } catch (error) {
    next(error);
  }
};

// Delete User for Admin

const deleteUserById = async (req, res, next) => {
  try {
    const id = req.params.id;

    const user = await User.findByIdAndDelete({ _id: id, isAdmin: false });

    if (!user) {
      throw createError(404, "User dose not exist with this id");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "User successfully deleted",
    });
  } catch (error) {
    next(error);
  }
};

// Process Register

const processRegister = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const userExists = await User.exists({ email: email });

    if (userExists) {
      throw createError(
        409,
        "User with this email already exists, Please signin"
      );
    }

    const jwtToken = await createJsonWebToken(
      { name, email, password, phone, address },
      jwtSecretKey,
      { expiresIn: "10m" }
    );

    const emailData = {
      email,
      subject: "Account Activation Email",
      html: `<h1>Hello ${name}!</h1> <p>Please click here to <a href = "${clientUrl}/api/user/activate/${jwtToken}" target = "_black">activate your account</a></p>`,
    };

    try {
      await sendEmailWithNodeMailer(emailData);
    } catch (emailError) {
      next(createError(500, "Failed to send verification email"));
      return;
    }

    return successResponse(res, {
      statusCode: 200,
      message: `Please go to your ${email} for completing your registration process`,
      payload: { token: jwtToken },
    });
  } catch (error) {
    next(error);
  }
};

// Active user

const activateUserAccount = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw createError(404, "Token not found");
    }

    try {
      const decoded = jwt.verify(token, jwtSecretKey);

      if (!decoded) {
        throw createError(401, "User could not be verified");
      }

      const userExists = await User.exists({ email: decoded.email });

      if (userExists) {
        throw createError(
          409,
          "User with this email already exists, Please signin"
        );
      }

      await User.create(decoded);

      return successResponse(res, {
        statusCode: 201,
        message: "User was registered successfully",
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw createError(401, "Token has expired");
      } else if (error.name === "JsonWebTokenError") {
        throw createError(401, "Invalid token");
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};

// Update user by id

const updateUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const updateOptions = { new: true, runValidators: true, context: "query" };

    await findWithId(User, userId, updateOptions);

    let updates = {};

    for (let key in req.body) {
      if (["name", "phone", "password", "address"].includes(key)) {
        updates[key] = req.body[key];
      }
    }

    const updateUser = await User.findByIdAndUpdate(
      userId,
      updates,
      updateOptions
    );

    if (!updateUser) {
      throw createError(404, "User with is id does not exist");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "User was update successfully",
      payload: updateUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  deleteUserById,
  processRegister,
  activateUserAccount,
  updateUserById,
};
