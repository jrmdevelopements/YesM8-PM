const Job = require("../models/Job");
const { Parser } = require("json2csv");
const { AppError } = require("../utils/errorHandler");

// Convert camelCase keys to snake_case (flat object only)
const toSnakeCase = (obj) => {
  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    newObj[snakeKey] = value;
  }
  return newObj;
};

const cleanTime = (value) => { /* unchanged */ };
const cleanDate = (value) => { /* unchanged */ };

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
      next(error);
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
        throw new AppError("Job not found", 404);  // FIXED: 404
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

      // Define CSV fields – you can extend this list as needed
      const fields = Object.keys(jobs[0]); // all fields from the combined object
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