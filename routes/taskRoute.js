const express = require("express");
const taskController = require("../controllers/taskController");

const router = express.Router();

router.route("/").post(taskController.createTask);

router
  .route("/:id")
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask)
  .get(taskController.getOneTask);

router.get("/search/:id", taskController.searchTasks);

module.exports = router;
