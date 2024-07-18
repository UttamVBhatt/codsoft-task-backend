const express = require("express");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

router.route("/my/:userId").get(notificationController.myNotifications);

router.get("/:id", notificationController.getOneNotification);

module.exports = router;
