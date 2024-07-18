const Task = require("../models/taskModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const User = require("../models/userModel");
const Notification = require("../models/notification");

exports.createTask = catchAsync(async (req, res, next) => {
  const task = await Task.create(req.body);

  let user;

  if (req.body.team) {
    user = await User.findById(req.body.assignedTo);

    if (!user) next(new AppError("No such user found with that ID", 404));

    const notification = await Notification.create({
      message: "A new team task has been assigned to you",
      user: req.body.assignedTo,
    });

    user.teamTasks.unshift(task);
    user.notifications.unshift(notification);

    await user.save({ validteBeforeSave: false });
  } else {
    user = await User.findById(req.body.createdBy);

    if (!user) next(new AppError("No such user found with that ID", 404));

    user.individual.unshift(task);

    await user.save({ validteBeforeSave: false });
  }

  res.status(200).json({
    status: "success",
    message: "Task Created Successfully",
    data: {
      task,
      user,
    },
  });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!task) next(new AppError("No such task found with that ID", 404));

  res.status(201).json({
    status: "success",
    message: "Task Updated Successfully",
    data: {
      task,
    },
  });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  await Task.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Task Deleted Successfully",
  });
});

exports.getOneTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) next(new AppError("No such task found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

exports.searchTasks = catchAsync(async (req, res, next) => {
  const keyword = req.query.keyword;

  if (!keyword) next(new AppError("Please provide a keyword to search"));

  const myTasks = await Task.find({
    $or: [{ createdBy: req.params.id }, { assignedTo: req.params.id }],
  });

  const tasks = myTasks.find({
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ],
  });

  res.status(200).json({
    status: "success",
    noOfTasks: tasks.length,
    data: {
      tasks,
    },
  });
});
