const Notification = require("../models/notification");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const User = require("../models/userModel");

exports.myNotifications = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);

  if (!user.notifications)
    next(new AppError("You don't have any notification yet"));

  let notifications = [];

  user.notifications.forEach(async (not) => {
    const notification = await Notification.findById(not);

    notifications.unshift(notification);
  });

  res.status(200).json({
    status: "success",
    noOfNotifications: notifications.length,
    data: {
      notifications,
    },
  });
});

exports.getOneNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification)
    next(new AppError("No such notification found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: {
      notification,
    },
  });
});
