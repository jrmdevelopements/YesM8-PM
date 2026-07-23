// controllers/taskController.js
const Task = require("../models/Task");
const { AppError } = require("../utils/errorHandler");

const taskController = {
  /**
   * Get all tasks for a job
   */
  async getTasksByJob(req, res, next) {
    try {
      const { job_uuid } = req.params;
      const tasks = await Task.findByJob(job_uuid);
      
      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all tasks
   */
  async getAllTasks(req, res, next) {
    try {
      const tasks = await Task.findAll();
      
      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single task by ID
   */
  async getTaskById(req, res, next) {
    try {
      const { task_id } = req.params;
      const task = await Task.findByUuid(task_id);
      
      if (!task) {
        throw new AppError("Task not found", 404);
      }
      
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new task
   */
  async createTask(req, res, next) {
    try {
      const { job_uuid, name, status, assigned_to, priority, due_date, description } = req.body;
      
      if (!job_uuid || !name) {
        throw new AppError("Missing required fields: job_uuid, name", 400);
      }
      
      const task = await Task.create({
        job_uuid,
        name,
        status,
        assigned_to,
        priority,
        due_date,
        description,
      });
      
      res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a task
   */
  async updateTask(req, res, next) {
    try {
      const { task_id } = req.params;
      const taskData = req.body;
      
      const updatedTask = await Task.update(task_id, taskData);
      
      if (!updatedTask) {
        throw new AppError("Task not found", 404);
      }
      
      res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: updatedTask,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a task
   */
  async deleteTask(req, res, next) {
    try {
      const { task_id } = req.params;
      const deletedTask = await Task.delete(task_id);
      
      if (!deletedTask) {
        throw new AppError("Task not found", 404);
      }
      
      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
        data: deletedTask,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Bulk create tasks for a job
   */
  async bulkCreateTasks(req, res, next) {
    try {
      const { job_uuid, tasks } = req.body;
      
      if (!job_uuid || !tasks || !Array.isArray(tasks)) {
        throw new AppError("Missing required fields: job_uuid, tasks (array)", 400);
      }
      
      const createdTasks = [];
      for (const task of tasks) {
        const newTask = await Task.create({
          job_uuid,
          name: task.name,
          status: task.status,
          assigned_to: task.assigned_to,
          priority: task.priority,
          due_date: task.due_date,
          description: task.description,
        });
        createdTasks.push(newTask);
      }
      
      res.status(201).json({
        success: true,
        message: `${createdTasks.length} tasks created successfully`,
        data: createdTasks,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = taskController;