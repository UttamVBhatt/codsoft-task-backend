const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
    minlength: 2,
    maxlength: 20,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide your password"],
    minlength: 8,
    maxlength: 14,
    trim: true,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    trim: true,
    minlength: 8,
    maxlength: 14,
    select: false,
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message:
        "Both passwords are not same, please check your password and try again!!",
    },
  },
  photo: String,
  image: String,
  teams: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Team",
    },
  ],
  role: {
    type: String,
    enum: {
      values: ["user", "admin"],
      message: "Please choose between user and admin only",
    },
    default: "user",
  },
  notifications: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Notification",
    },
  ],
  individual: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Task",
    },
  ],
  teamTasks: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Task",
    },
  ],
  passwordResetToken: String,
  tokenExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.comparePasswords = async (
  requestedPassword,
  existedPassword
) => await bcrypt.compare(requestedPassword, existedPassword);

userSchema.methods.createSendToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha-256")
    .update(resetToken)
    .digest("hex");

  this.tokenExpires = new Date(Date.now() + 5 * 60 * 60 * 1000);

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
