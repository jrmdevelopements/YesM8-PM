// models/Task.js
const pool = require("../config/db");

class Task {
  static COLUMNS = [
    "job_uuid",
    "name",
    "status",
    "assigned_to",
    "priority",
    "due_date",
    "description",
    "created_at",
    "updated_at",
  ];

  static async create(taskData) {
    const { job_uuid, name, status, assigned_to, priority, due_date, description } = taskData;
    
    const query = `
      INSERT INTO tasks (job_uuid, name, status, assigned_to, priority, due_date, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
      job_uuid,
      name,
      status || 'To Do',
      assigned_to || null,
      priority || 'Medium',
      due_date || null,
      description || null
    ]);
    
    return await this.findByUuid(result.insertId);
  }

  static async update(taskId, taskData) {
    const { name, status, assigned_to, priority, due_date, description } = taskData;
    
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }
    if (assigned_to !== undefined) {
      updates.push("assigned_to = ?");
      values.push(assigned_to);
    }
    if (priority !== undefined) {
      updates.push("priority = ?");
      values.push(priority);
    }
    if (due_date !== undefined) {
      updates.push("due_date = ?");
      values.push(due_date);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }
    
    if (updates.length === 0) return null;
    
    values.push(taskId);
    const query = `UPDATE tasks SET ${updates.join(", ")}, updated_at = NOW() WHERE id = ?`;
    await pool.query(query, values);
    
    return await this.findByUuid(taskId);
  }

  static async delete(taskId) {
    const task = await this.findByUuid(taskId);
    if (!task) return null;
    
    await pool.query("DELETE FROM tasks WHERE id = ?", [taskId]);
    return task;
  }

  static async findByUuid(taskId) {
    const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [taskId]);
    if (rows.length === 0) return null;
    return rows[0];
  }

  static async findByJob(job_uuid) {
    const [rows] = await pool.query(
      "SELECT * FROM tasks WHERE job_uuid = ? ORDER BY created_at DESC",
      [job_uuid]
    );
    return rows;
  }

  static async findAll() {
    const [rows] = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
    return rows;
  }

  static async deleteByJob(job_uuid) {
    await pool.query("DELETE FROM tasks WHERE job_uuid = ?", [job_uuid]);
  }
}

module.exports = Task;