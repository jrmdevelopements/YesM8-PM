// routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// Get all tasks
router.get("/tasks", taskController.getAllTasks);

// Get tasks by job
router.get("/tasks/job/:job_uuid", taskController.getTasksByJob);

// Get single task
router.get("/tasks/:task_id", taskController.getTaskById);

// Create task
router.post("/tasks", taskController.createTask);

// Bulk create tasks
router.post("/tasks/bulk", taskController.bulkCreateTasks);

// Update task
router.put("/tasks/:task_id", taskController.updateTask);

// Delete task
router.delete("/tasks/:task_id", taskController.deleteTask);

module.exports = router;