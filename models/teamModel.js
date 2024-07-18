const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name for your team"],
    minlength: [2, "Team's name must contain atleast 2 characters"],
    maxlength: [20, "Team's name should not contain more than 20 characters"],
    trim: true,
  },
  members: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [
        true,
        "Please provide the id of the users who will be the members of the team",
      ],
    },
  ],
  admin: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Please provide an id of a user to become an admin"],
  },
  image: {
    type: String,
  },
});

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;
