const pool = require("../config/db");
const Discovery = require("./Discovery");
const ProjectManagement = require("./ProjectManagement");
const Design = require("./Design");
const Settings = require("./Settings");

class Job {
  static BASE_FIELDS = ["job_uuid", "sm8_account_uuid", "generated_job_id", "notes"];

  // --- CREATE ---
  static async create(jobData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert base job
      const baseCols = this.BASE_FIELDS;
      const baseVals = baseCols.map(c => jobData[c]);
      const baseQuery = `INSERT INTO jobs (${baseCols.join(',')}) VALUES (${baseCols.map(() => '?').join(',')})`;
      await connection.query(baseQuery, baseVals);

      const jobUuid = jobData.job_uuid;

      // Insert child tables
      await Discovery.create(jobUuid, jobData, connection);
      await ProjectManagement.create(jobUuid, jobData, connection);
      await Design.create(jobUuid, jobData, connection);
      await Settings.create(jobUuid, jobData, connection);

      await connection.commit();
      return await this.findByUuid(jobUuid);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // --- FIND by UUID ---
  static async findByUuid(job_uuid) {
    const [rows] = await pool.query("SELECT * FROM jobs WHERE job_uuid = ?", [job_uuid]);
    if (rows.length === 0) return null;
    const job = rows[0];

    const [discovery, projectManagement, design, settings] = await Promise.all([
      Discovery.findByJobUuid(job_uuid),
      ProjectManagement.findByJobUuid(job_uuid),
      Design.findByJobUuid(job_uuid),
      Settings.findByJobUuid(job_uuid),
    ]);

    return { ...job, ...discovery, ...projectManagement, ...design, ...settings };
  }

  // --- FIND ALL ---
  static async findAll() {
    const [jobs] = await pool.query("SELECT * FROM jobs ORDER BY created_at DESC");
    const fullJobs = await Promise.all(
      jobs.map(async (job) => {
        const [discovery, projectManagement, design, settings] = await Promise.all([
          Discovery.findByJobUuid(job.job_uuid),
          ProjectManagement.findByJobUuid(job.job_uuid),
          Design.findByJobUuid(job.job_uuid),
          Settings.findByJobUuid(job.job_uuid),
        ]);
        return { ...job, ...discovery, ...projectManagement, ...design, ...settings };
      })
    );
    return fullJobs;
  }

  // --- FIND by Account ---
  static async findByAccount(sm8_account_uuid) {
    const [jobs] = await pool.query(
      "SELECT * FROM jobs WHERE sm8_account_uuid = ? ORDER BY created_at DESC",
      [sm8_account_uuid]
    );
    const fullJobs = await Promise.all(
      jobs.map(async (job) => {
        const [discovery, projectManagement, design, settings] = await Promise.all([
          Discovery.findByJobUuid(job.job_uuid),
          ProjectManagement.findByJobUuid(job.job_uuid),
          Design.findByJobUuid(job.job_uuid),
          Settings.findByJobUuid(job.job_uuid),
        ]);
        return { ...job, ...discovery, ...projectManagement, ...design, ...settings };
      })
    );
    return fullJobs;
  }

  // --- FIND by Account and Date Range ---
  static async findByAccountAndDateRange(sm8_account_uuid, start_date, end_date) {
    const [jobs] = await pool.query(
      `SELECT * FROM jobs
       WHERE sm8_account_uuid = ? AND DATE(created_at) BETWEEN ? AND ?
       ORDER BY created_at DESC`,
      [sm8_account_uuid, start_date, end_date]
    );
    const fullJobs = await Promise.all(
      jobs.map(async (job) => {
        const [discovery, projectManagement, design, settings] = await Promise.all([
          Discovery.findByJobUuid(job.job_uuid),
          ProjectManagement.findByJobUuid(job.job_uuid),
          Design.findByJobUuid(job.job_uuid),
          Settings.findByJobUuid(job.job_uuid),
        ]);
        return { ...job, ...discovery, ...projectManagement, ...design, ...settings };
      })
    );
    return fullJobs;
  }

  // --- UPDATE ---
  static async update(job_uuid, jobData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update base
      const baseCols = ["generated_job_id", "notes"];
      const updates = [];
      const values = [];
      for (const col of baseCols) {
        if (jobData[col] !== undefined) {
          updates.push(`${col} = ?`);
          values.push(jobData[col]);
        }
      }
      if (updates.length > 0) {
        values.push(job_uuid);
        await connection.query(
          `UPDATE jobs SET ${updates.join(', ')} WHERE job_uuid = ?`,
          values
        );
      }

      // Update child tables
      await Discovery.update(job_uuid, jobData, connection);
      await ProjectManagement.update(job_uuid, jobData, connection);
      await Design.update(job_uuid, jobData, connection);
      await Settings.update(job_uuid, jobData, connection);

      await connection.commit();
      return await this.findByUuid(job_uuid);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // --- DELETE ---
  static async delete(job_uuid) {
    const job = await this.findByUuid(job_uuid);
    if (!job) return null;
    await pool.query("DELETE FROM jobs WHERE job_uuid = ?", [job_uuid]);
    return job;
  }
}

module.exports = Job;