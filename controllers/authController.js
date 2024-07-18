const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const mail = require("../utils/sendMail");
const crypto = require("crypto");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_STRING, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = createToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    data: {
      user,
      token,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    next(new AppError("Please provide your email and password", 401));

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePasswords(password, user.password)))
    next(new AppError("Please provide valid email or password"), 400);

  createSendToken(user, 200, res);
});

exports.logOut = catchAsync(async (req, res, next) => {
  const token = "Logged Out";

  const cookieOptions = {
    expires: new Date(Date.now() + 1 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  res.status(200).json({
    status: "success",
    message: "Logged Out Successfully",
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("+password");

  if (!user || !(await user.comparePasswords(req.body.password, user.password)))
    next(new AppError("Please provide valid password", 400));

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  res.status(201).json({
    status: "success",
    message: "Password Updated Successfully",
    data: {
      user,
    },
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    next(
      new AppError(
        "No such user found with that email, please provide a valid email",
        404
      )
    );

  const resetToken = user.createSendToken();

  console.log(resetToken);

  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `https://tasko/reset/password/${resetToken}`;

    const message = `Forgot your password? Provide your new password and password confirm to this url\n\n ${resetURL}`;

    mail({
      to: user.email,
      subject: "Reset Your Password",
      message,
    });

    res.status(200).json({
      status: "success",
      message:
        "Email send successfully, please check your email/spam folder for reset password link",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.tokenExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error while sending email, please try again later",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash("sha-256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashToken,
    tokenExpires: { $gt: Date.now() },
  });

  if (!user) next(new AppError("Token is invalid or expired", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.tokenExpires = undefined;

  await user.save();

  createSendToken(user, 200, res);
});
