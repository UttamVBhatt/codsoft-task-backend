const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/AppError");
const Team = require("./../models/teamModel");
const Notification = require("../models/notification");
const User = require("../models/userModel");

exports.createTeam = catchAsync(async (req, res, next) => {
  const team = await Team.create(req.body);

  const notification = await Notification.create({
    message: `You have been chosen for the team ${team.name.split(" ")[0]}`,
  });

  team.members.forEach(async (mem) => {
    const user = await User.findById(mem);

    user.notifications.unshift(notification);

    await user.save({ validateBeforeSave: false });
  });

  res.status(201).json({
    status: "success",
    message: "Team Created Successfully",
    data: {
      team,
    },
  });
});

exports.oneTeam = catchAsync(async (req, res, next) => {
  const team = await Team.findById(req.params.id).populate({
    path: "members admin",
    select: "name email -_id",
  });

  if (!team) next(new AppError("No such team found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: {
      team,
    },
  });
});

exports.addRemoveMember = catchAsync(async (req, res, next) => {
  const team = await Team.findById(req.params.teamId);
  const user = await User.findById(req.params.userId);

  if (!team || !user)
    next(new AppError("Please provide valid team or user ID", 400));

  if (team.members.includes(req.params.userId)) {
    const index = team.members.indexOf(req.params.userId);

    team.members.splice(index, 1);

    const notification = await Notification.create({
      message: `You have been removed from the team ${team.name.split(" ")[0]}`,
    });

    user.notifications.unshift(notification);

    await user.save({ validateBeforeSave: false });

    await team.save({ validateBeforeSave: false });

    return res.status(200).json({
      status: "success",
      message: "User Removed Successfully",
      data: {
        team,
      },
    });
  } else {
    const notification = await Notification.create({
      message: `You have been added to the team ${team.name.split(" ")[0]}`,
    });

    team.members.unshift(req.params.userId);

    user.notifications.unshift(notification);

    await team.save({ validateBeforeSave: false });

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      status: "success",
      message: "User Added Successfully",
      data: {
        team,
      },
    });
  }
});

exports.deleteTeam = catchAsync(async (req, res, next) => {
  const team = await Team.findById(req.params.id);

  if (!team) next(new AppError("No such team found with that ID", 404));

  const notification = await Notification.create({
    message: `Your team ${
      team.name.split(" ")[0]
    } has been deleted by team's admin`,
  });

  team.members.forEach(async (mem) => {
    const user = await User.findById(mem);

    user.notifications.unshift(notification);

    await user.save({ validateBeforeSave: false });
  });

  await Team.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Team Deleted Successfully",
  });
});

// exports.deleteTeam = catchAsync(async (req, res, next) => {});
