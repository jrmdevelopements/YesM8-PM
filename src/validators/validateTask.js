// validators/validateTask.js
const { body, param, validationResult } = require("express-validator");
const { AppError } = require("../utils/errorHandler");

const validateTask = [
  body("job_uuid").notEmpty().withMessage("job_uuid is required"),
  body("name").notEmpty().withMessage("Task name is required"),
  body("status").optional().isIn(["To Do", "In Progress", "Review", "Done", "Blocked"]),
  body("priority").optional().isIn(["Low", "Medium", "High", "Urgent"]),
  body("assigned_to").optional().isString(),
  // body("due_date").optional().isISO8601().withMessage("Invalid date format"),
  body("description").optional().isString(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new AppError("Validation failed", 400, errors.array());
      return next(error);
    }
    next();
  },
];

const validateTaskId = [
  param("task_id").isInt().withMessage("Invalid task ID"),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new AppError("Validation failed", 400, errors.array());
      return next(error);
    }
    next();
  },
];

module.exports = { validateTask, validateTaskId };