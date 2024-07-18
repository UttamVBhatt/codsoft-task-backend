const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, "Please provide a message for the notification"],
    trim: true,
    minlength: [10, "A notification must contain atleast 10 characters"],
    maxlength: [
      100,
      "A notification should not contain more than 100 characters",
    ],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  read: {
    type: Boolean,
    default: false,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
