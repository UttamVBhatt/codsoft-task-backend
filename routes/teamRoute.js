const teamController = require("../controllers/teamController");
const express = require("express");

const router = express.Router();

router.route("/").post(teamController.createTeam);

router
  .route("/:id")
  .get(teamController.oneTeam)
  .delete(teamController.deleteTeam);

router.patch("/:teamId/:userId", teamController.addRemoveMember);

module.exports = router;
