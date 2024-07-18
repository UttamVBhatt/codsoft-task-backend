const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const Notification = require("../models/notification");

cloudinary.config({
  cloud_name: "dd9txketg",
  api_key: "877765274648393",
  api_secret: "HO3B6pXsF8kjVTIiOwDecbw-oHI",
});

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/userImages");
  },
  filename: (req, file, cb) => {
    cb(null, `user-${req.params.id}-${file.originalname}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload only image", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhoto = upload.single("photo");

exports.updateData = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    next(new AppError("This route is not for updating password", 400));

  const updatedObject = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
  };

  const updatedBody = updatedObject(req.body, "name", "email");

  const user = await User.findByIdAndUpdate(req.params.id, updatedBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    message: "Data Updated Successfully",
    data: {
      user,
    },
  });
});

exports.searchUsers = catchAsync(async (req, res, next) => {
  const keyword = req.query.keyword;

  if (!keyword)
    next(new AppError("Please provide a keyword to search users", 400));

  const users = await User.find({
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { email: { $regex: keyword, $options: "i" } },
    ],
  });

  res.status(200).json({
    status: "success",
    noOfUsers: users.length,
    data: {
      users,
    },
  });
});

exports.uploadImage = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) next(new AppError("No such user found with that ID", 404));

  let upload;

  if (req.file) {
    upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "TaskManagerUser",
    });
  }

  if (req.file) {
    user.photo = req.file.filename;
    user.image = upload.secure_url;
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Image Uploaded Successfully",
    data: {
      user,
    },
  });
});

exports.removeAllNotifications = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) next(new AppError("No such user found with that ID", 404));

  user.notifications.forEach(async (not) => {
    await Notification.findByIdAndDelete(not);
  });

  user.notifications = [];

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "All Notifications have been removed",
    data: {
      user,
    },
  });
});

exports.removeOneNotification = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) next(new AppError("No such user found with that ID", 404));

  const index = user.notifications.indexOf(req.params.notId);

  user.notifications.splice(index, 1);

  await Notification.findByIdAndDelete(req.params.notId);

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Message Removed Successfully",
    data: {
      user,
    },
  });
});
