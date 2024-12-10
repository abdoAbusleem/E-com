const User = require("../models/user");
const asyncWrapper = require("../middleware/asyncWrapper");
const httpStatusText = require("../Enums/httpStatusText");
const appError = require("../utils/appError");
const userTypes = require("../Enums/userTypes");
const userRole = require("../Enums/userRoles");
const bcrypt = require("bcryptjs");
const generateJWT = require("../utils/generateJWT");
const crypto = require("crypto");
const { sendResetcodeToMail } = require("../services/sendingEmails");
const { message, getPasswordResetEmail } = require("../Enums/errorMessage");
const { validateRegiser, validateLogin } = require("../utils/validation");

const register = asyncWrapper(async (req, res, next) => {
  let validationError = await validateRegiser(req.body);
  if (validationError) {
    return res.status(400).send(validationError.details[0].message);
  }
  const {
    firstName,
    lastName,
    email,
    password,
    role,
    zip,
    country,
    phone,
    type,
    street,
    city,
    appartment,
  } = req.body;

  const oldUser = await User.findOne({ email: email });

  if (oldUser) {
    const error = appError.create(
      message.userAlreadyExists,
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
    zip,
    country,
    phone,
    type,
    street,
    city,
    appartment,
  });

  await newUser.save();

  const token = await generateJWT({
    id: newUser._id,
    role: newUser.role,
    type: newUser.type,
    firstName: newUser.firstName,
    email: newUser.email,
  });

  res.cookie("accessToken", token, {
    httpOnly: true,
  });

  return res.status(201).send({ status: httpStatusText.SUCCESS });
});

const login = asyncWrapper(async (req, res, next) => {
  let validationError = await validateLogin(req.body);
  if (validationError) {
    return res.status(400).send(validationError.details[0].message);
  }
  const { email, password } = req.body;

  if (!email && !password) {
    const error = appError.create(
      message.someThingWrong,
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    const error = appError.create(
      message.userNotFound,
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const matchedPassword = await bcrypt.compare(password, user.password);

  if (matchedPassword) {
    const token = await generateJWT({
      id: user._id,
      role: user.role,
      type: user.type,
      firstName: user.firstName,
      email: user.email,
    });
    res.cookie("accessToken", token, {
      httpOnly: true,
    });

    return res.status(201).send({ status: httpStatusText.SUCCESS });
  } else {
    const error = appError.create(
      message.someThingWrong,
      500,
      httpStatusText.ERROR
    );
    return next(error);
  }
});

const becomeAseller = asyncWrapper(async (req, res, next) => {
  const _id = req.currentUser.id;

  const findUser = await User.findOneAndUpdate(
    { _id },
    { $set: { role: userRole.MANGER, type: userTypes.SELLER } },
    { new: true }
  );

  if (!findUser) {
    const error = appError.create(
      message.someThingWrong,
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  return res.status(200).send({ status: httpStatusText.SUCCESS });
});

const forgetPassword = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    const error = appError.create(
      message.userNotFound,
      400,
      httpStatusText.FAIL
    );//
    return next(error);
  }

  const verificationCode = crypto.randomBytes(3).toString("hex"); // Example: a 6-character verification code
  user.verificationCode = verificationCode;
  user.verificationCodeExpires = Date.now() + 3600000; // 1 hour
  await user.save();
  sendResetcodeToMail(
    email,
    "Password Reset",
    getPasswordResetEmail(verificationCode)
  );
  return res.status(200).send({ status: httpStatusText.SUCCESS });
});

const resetPassword = asyncWrapper(async (req, res, next) => {
  const { email, verificationCode, newPassword } = req.body;
  const user = await User.findOne({
    email,
    verificationCode,
    verificationCodeExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = appError.create(
      message.resetPasswordError,
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword; // Make sure to hash the password before saving it
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  return res.status(200).send({ status: httpStatusText.SUCCESS });
});

const logOut = asyncWrapper(async (req, res, next) => {
  res.cookie("accessToken", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  return res.status(200).send({ status: httpStatusText.SUCCESS });
});

module.exports = {
  register,
  login,
  becomeAseller,
  forgetPassword,
  resetPassword,
  logOut,
};
