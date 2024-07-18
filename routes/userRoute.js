const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");
const express = require("express");

const router = express.Router();

// Authentication Routes
router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.get("/logout", authController.logOut);

// User Routes
router.post(
  "/upload/image/:id",
  userController.uploadPhoto,
  userController.uploadImage
);

router.get("/search", userController.searchUsers);

router
  .route("/:id")
  .patch(userController.updateData)
  .get(userController.removeAllNotifications);

router.patch("/update/password/:id", authController.updatePassword);

router.patch("/:id/:notId", userController.removeOneNotification);

router.post("/forgot/password", authController.forgotPassword);
router.post("/reset/password/:token", authController.resetPassword);

module.exports = router;
