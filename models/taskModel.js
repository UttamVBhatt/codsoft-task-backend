const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide your task a title"],
    minlength: [3, "Your task's title must contain atleast 3 characters"],
    maxlength: [30, "Your task should not contain more than 30 characters"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please provide a description for your task"],
    minlength: [10, "Description must contain atleast 10 characters"],
    maxlength: [
      80,
      "Task's description should not contain more than 80 characters",
    ],
    trim: true,
  },
  status: {
    type: String,
    enum: {
      values: ["todo", "inProgress", "completed"],
      message:
        "Your task should be at either of three stages todo, in-progress or completed",
    },
    default: "todo",
  },
  team: {
    type: mongoose.Schema.ObjectId,
    ref: "Team",
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deadline: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  active: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
  },
  timeline: {
    started: {
      type: String,
      minlength: 3,
      trim: true,
    },
    assigned: {
      type: String,
      minlength: 3,
      trim: true,
    },
    completed: {
      type: String,
      minlength: 3,
      trim: true,
    },
    inProgress: {
      type: String,
      minlength: 3,
      trim: true,
    },
    commented: {
      type: String,
      minlength: [3, "A Comment should contain atleast 3 characters"],
      trim: true,
    },
    bug: {
      type: String,
      minlength: 3,
      trim: true,
    },
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
