const pool = require("../config/db");
const Discovery = require("./Discovery");
const ProjectManagement = require("./ProjectManagement");
const Design = require("./Design");
const Settings = require("./Settings");
const Templates = require("./Templates");
const Forms = require("./Forms");
const Accounts = require("./Accounts");

class Job {
  static BASE_FIELDS = [
    "job_uuid",
    "sm8_account_uuid",
    "generated_job_id",
    "notes",
  ];

  // Only map base fields (no prefix) to themselves
  static internalToDbMap = {
    job_uuid: "job_uuid",
    sm8_account_uuid: "sm8_account_uuid",
    generated_job_id: "generated_job_id",
    notes: "notes",
  };

  static mapToDbColumns(data) {
    const mapped = {};
    for (const [key, value] of Object.entries(data)) {
      // If key is in the map, use the mapped value; otherwise keep as is
      const dbKey = this.internalToDbMap[key] || key;
      mapped[dbKey] = value;
    }
    return mapped;
  }

  // ─── CREATE ──────────────────────────────────────────────
  static async create(jobData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const dbData = this.mapToDbColumns(jobData);

      const baseCols = this.BASE_FIELDS;
      const baseVals = baseCols.map((c) => dbData[c]);
      const baseQuery = `INSERT INTO jobs (${baseCols.join(",")}) VALUES (${baseCols.map(() => "?").join(",")})`;
      await connection.query(baseQuery, baseVals);

      const jobUuid = dbData.job_uuid;

      await Discovery.create(jobUuid, dbData, connection);
      await ProjectManagement.create(jobUuid, dbData, connection);
      await Design.create(jobUuid, dbData, connection);
      await Settings.create(jobUuid, dbData, connection);
      await Templates.create(jobUuid, dbData, connection);
      await Forms.create(jobUuid, dbData, connection);
      await Accounts.create(jobUuid, dbData, connection);

      await connection.commit();
      return await this.findByUuid(jobUuid);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ─── FIND by UUID ────────────────────────────────────────
  static async findByUuid(job_uuid) {
    const [rows] = await pool.query("SELECT * FROM jobs WHERE job_uuid = ?", [
      job_uuid,
    ]);
    if (rows.length === 0) return null;
    const job = rows[0];

    const [
      discovery,
      projectManagement,
      design,
      settings,
      templates,
      forms,
      accounts,
    ] = await Promise.all([
      Discovery.findByJobUuid(job_uuid),
      ProjectManagement.findByJobUuid(job_uuid),
      Design.findByJobUuid(job_uuid),
      Settings.findByJobUuid(job_uuid),
      Templates.findByJobUuid(job_uuid),
      Forms.findByJobUuid(job_uuid),
      Accounts.findByJobUuid(job_uuid),
    ]);

    return {
      ...job,
      ...discovery,
      ...projectManagement,
      ...design,
      ...settings,
      ...templates,
      ...forms,
      ...accounts,
    };
  }

  // ─── FIND ALL ────────────────────────────────────────────
  static async findAll() {
    const [jobs] = await pool.query(
      "SELECT * FROM jobs ORDER BY created_at DESC",
    );
    const fullJobs = await Promise.all(
      jobs.map(async (job) => {
        const [
          discovery,
          projectManagement,
          design,
          settings,
          templates,
          forms,
          accounts,
        ] = await Promise.all([
          Discovery.findByJobUuid(job.job_uuid),
          ProjectManagement.findByJobUuid(job.job_uuid),
          Design.findByJobUuid(job.job_uuid),
          Settings.findByJobUuid(job.job_uuid),
          Templates.findByJobUuid(job.job_uuid),
          Forms.findByJobUuid(job.job_uuid),
          Accounts.findByJobUuid(job.job_uuid),
        ]);
        return {
          ...job,
          ...discovery,
          ...projectManagement,
          ...design,
          ...settings,
          ...templates,
          ...forms,
          ...accounts,
        };
      }),
    );
    return fullJobs;
  }

  // ─── FIND by Account ─────────────────────────────────────
  static async findByAccount(sm8_account_uuid) {
    const [jobs] = await pool.query(
      "SELECT * FROM jobs WHERE sm8_account_uuid = ? ORDER BY created_at DESC",
      [sm8_account_uuid],
    );
    const fullJobs = await Promise.all(
      jobs.map(async (job) => {
        const [
          discovery,
          projectManagement,
          design,
          settings,
          templates,
          forms,
          accounts,
        ] = await Promise.all([
          Discovery.findByJobUuid(job.job_uuid),
          ProjectManagement.findByJobUuid(job.job_uuid),
          Design.findByJobUuid(job.job_uuid),
          Settings.findByJobUuid(job.job_uuid),
          Templates.findByJobUuid(job.job_uuid),
          Forms.findByJobUuid(job.job_uuid),
          Accounts.findByJobUuid(job.job_uuid),
        ]);
        return {
          ...job,
          ...discovery,
          ...projectManagement,
          ...design,
          ...settings,
          ...templates,
          ...forms,
          ...accounts,
        };
      }),
    );
    return fullJobs;
  }

  // ─── FIND by Account and Date Range ─────────────────────
  static async findByAccountAndDateRange(
    sm8_account_uuid,
    start_date,
    end_date,
  ) {
    const [jobs] = await pool.query(
      `SELECT * FROM jobs
       WHERE sm8_account_uuid = ? AND DATE(created_at) BETWEEN ? AND ?
       ORDER BY created_at DESC`,
      [sm8_account_uuid, start_date, end_date],
    );
    const fullJobs = await Promise.all(
      jobs.map(async (job) => {
        const [
          discovery,
          projectManagement,
          design,
          settings,
          templates,
          forms,
          accounts,
        ] = await Promise.all([
          Discovery.findByJobUuid(job.job_uuid),
          ProjectManagement.findByJobUuid(job.job_uuid),
          Design.findByJobUuid(job.job_uuid),
          Settings.findByJobUuid(job.job_uuid),
          Templates.findByJobUuid(job.job_uuid),
          Forms.findByJobUuid(job.job_uuid),
          Accounts.findByJobUuid(job.job_uuid),
        ]);
        return {
          ...job,
          ...discovery,
          ...projectManagement,
          ...design,
          ...settings,
          ...templates,
          ...forms,
          ...accounts,
        };
      }),
    );
    return fullJobs;
  }

  // ─── UPDATE ──────────────────────────────────────────────
  static async update(job_uuid, jobData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const dbData = this.mapToDbColumns(jobData);

      const baseCols = ["generated_job_id", "notes"];
      const updates = [];
      const values = [];
      for (const col of baseCols) {
        if (dbData[col] !== undefined) {
          updates.push(`${col} = ?`);
          values.push(dbData[col]);
        }
      }
      if (updates.length > 0) {
        values.push(job_uuid);
        await connection.query(
          `UPDATE jobs SET ${updates.join(", ")} WHERE job_uuid = ?`,
          values,
        );
      }

      await Discovery.update(job_uuid, dbData, connection);
      await ProjectManagement.update(job_uuid, dbData, connection);
      await Design.update(job_uuid, dbData, connection);
      await Settings.update(job_uuid, dbData, connection);
      await Templates.update(job_uuid, dbData, connection);
      await Forms.update(job_uuid, dbData, connection);
      await Accounts.update(job_uuid, dbData, connection);

      await connection.commit();
      return await this.findByUuid(job_uuid);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ─── DELETE ──────────────────────────────────────────────
  // static async delete(job_uuid) {
  //   const job = await this.findByUuid(job_uuid);
  //   if (!job) return null;
  //   await pool.query("DELETE FROM jobs WHERE job_uuid = ?", [job_uuid]);
  //   return job;
  // }
  
  static async delete(job_uuid) {
    const job = await this.findByUuid(job_uuid);
    if (!job) return null;
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Delete tasks first
      await connection.query("DELETE FROM tasks WHERE job_uuid = ?", [job_uuid]);
      
      // Then delete the job
      await connection.query("DELETE FROM jobs WHERE job_uuid = ?", [job_uuid]);
      
      await connection.commit();
      return job;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Job;