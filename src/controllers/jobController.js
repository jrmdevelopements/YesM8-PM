const Job = require("../models/Job");
const { Parser } = require("json2csv");
const { AppError } = require("../utils/errorHandler");  // ← ADD THIS

// ─── Helpers ────────────────────────────────────────────────

// Convert camelCase keys to snake_case (flat object only)
const toSnakeCase = (obj) => {
  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    newObj[snakeKey] = value;
  }
  return newObj;
};

const cleanTime = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    if (value === "00:00:00" || value === "00:00" || value.endsWith(" 00:00:00"))
      return "";
    const parts = value.split(":");
    if (parts.length >= 2) {
      const hh = parts[0].padStart(2, "0");
      const mm = parts[1].padStart(2, "0");
      if (hh === "00" && mm === "00") return "";
      return `${hh}:${mm}`;
    }
    return "";
  }
  if (value instanceof Date) {
    const hh = String(value.getHours()).padStart(2, "0");
    const mm = String(value.getMinutes()).padStart(2, "0");
    const ss = String(value.getSeconds()).padStart(2, "0");
    if (hh === "00" && mm === "00" && ss === "00") return "";
    return `${hh}:${mm}`;
  }
  return "";
};

const cleanDate = (value) => {
  if (!value) return "";
  if (typeof value === "string" && value.startsWith("0000-00-00")) return "";
  let date;
  if (value instanceof Date) {
    if (value.toISOString().startsWith("1899-11-30")) return "";
    date = value;
  }
  if (typeof value === "string") {
    date = new Date(value);
    if (isNaN(date.getTime())) return "";
  }
  if (!date) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

// ─── Controller ────────────────────────────────────────────

const jobController = {
  async createJob(req, res, next) {
    try {
      
    
      
      const jobData = toSnakeCase(req.body);
        if (!jobData.sm8_account_uuid || !jobData.job_uuid) {
          throw new AppError("Missing required fields: job_uuid, sm8_account_uuid", 400);
      }
      const job = await Job.create(jobData);
      res.status(201).json({
        success: true,
        message: "Job created successfully",
        data: job,
      });
    } catch (error) {
      next(error); // pass to global handler
    }
  },

  async getAllJobs(req, res, next) {
    try {
      const jobs = await Job.findAll();
      res.status(200).json({
        success: true,
        count: jobs.length,
        data: jobs,
      });
    } catch (error) {
      next(error);
    }
  },

  async getJobByUuid(req, res, next) {
    try {
      const { job_uuid } = req.params;
      const job = await Job.findByUuid(job_uuid);
      if (!job) {
        throw new AppError("Job not found", 404);
      }
      res.status(200).json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  },

  async updateJob(req, res, next) {
    try {
      const { job_uuid } = req.params;
      const jobData = toSnakeCase(req.body);
      const updatedJob = await Job.update(job_uuid, jobData);
      if (!updatedJob) {
        throw new AppError("Job not found", 404);
      }
      res.status(200).json({
        success: true,
        message: "Job updated successfully",
        data: updatedJob,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteJob(req, res, next) {
    try {
      const { job_uuid } = req.params;
      const deletedJob = await Job.delete(job_uuid);
      if (!deletedJob) {
        throw new AppError("Job not found", 404);
      }
      res.status(200).json({
        success: true,
        message: "Job deleted successfully",
        data: deletedJob,
      });
    } catch (error) {
      next(error);
    }
  },

  async exportJobsToCSV(req, res, next) {
    try {
      const { sm8_account_uuid } = req.params;
      const { start_date, end_date } = req.query;

      if (!sm8_account_uuid) {
        throw new AppError("sm8_account_uuid is required", 400);
      }

      let jobs;
      if (start_date && end_date) {
        // Optionally validate date format
        jobs = await Job.findByAccountAndDateRange(
          sm8_account_uuid,
          start_date,
          end_date
        );
      } else {
        jobs = await Job.findByAccount(sm8_account_uuid);
      }

      if (!jobs || jobs.length === 0) {
        throw new AppError("No jobs found to export", 404);
      }

      // ... CSV generation remains same ...
      const fields = [ /* ... unchanged ... */ ];
      const parser = new Parser({ fields, excelStrings: false });
      const csv = parser.parse(jobs);
      const filename = `jobs_export_${sm8_account_uuid}_${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.csv`;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = jobController;