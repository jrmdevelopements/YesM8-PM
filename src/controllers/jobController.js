const Job = require("../models/Job");
const { Parser } = require("json2csv");

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
  async createJob(req, res) {
    try {
      const jobData = toSnakeCase(req.body);
      const job = await Job.create(jobData);
      res.status(201).json({
        success: true,
        message: "Job created successfully",
        data: job,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getAllJobs(req, res) {
    try {
      const jobs = await Job.findAll();
      res.status(200).json({
        success: true,
        count: jobs.length,
        data: jobs,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getJobByUuid(req, res) {
    try {
      const { job_uuid } = req.params;
      const job = await Job.findByUuid(job_uuid);
      if (!job) {
        return res.status(200).json({
          success: false,
          message: "Job not found",
        });
      }
      res.status(200).json({ success: true, data: job });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateJob(req, res) {
    try {
      const { job_uuid } = req.params;
      const jobData = toSnakeCase(req.body);
      const updatedJob = await Job.update(job_uuid, jobData);
      if (!updatedJob) {
        return res.status(404).json({
          success: false,
          message: "Job not found",
        });
      }
      res.status(200).json({
        success: true,
        message: "Job updated successfully",
        data: updatedJob,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteJob(req, res) {
    try {
      const { job_uuid } = req.params;
      const deletedJob = await Job.delete(job_uuid);
      if (!deletedJob) {
        return res.status(404).json({
          success: false,
          message: "Job not found",
        });
      }
      res.status(200).json({
        success: true,
        message: "Job deleted successfully",
        data: deletedJob,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async exportJobsToCSV(req, res) {
    try {
      const { sm8_account_uuid } = req.params;
      const { start_date, end_date } = req.query;

      if (!sm8_account_uuid) {
        return res.status(400).json({
          success: false,
          message: "sm8_account_uuid is required",
        });
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
        return res.status(404).json({
          success: false,
          message: "No jobs found to export",
        });
      }

      // Use q_* prefixed column names from DB
      const fields = [
        { label: "Job UUID", value: "job_uuid" },      
        { label: "Job Number", value: "generated_job_id" },
      
        // Discovery fields (with q_ prefix)
        { label: "What are you after?", value: "q_what_after" },
        { label: "Different app?", value: "q_diff_app" },
        { label: "Different app details", value: "q_diff_app_details" },
        { label: "Special integration?", value: "q_special_integration" },
        { label: "Has website?", value: "q_has_website" },
        { label: "Website address", value: "q_website_address" },
        { label: "Website form link?", value: "q_website_form_link" },
        { label: "Devices", value: (row) => (row.q_devices ? JSON.parse(row.q_devices).join(", ") : "") },
        { label: "Staff using Android?", value: "q_staff_android" },
        { label: "Android limitation noted?", value: "q_android_limitation" },
        { label: "Accounting package needed?", value: "q_accounting" },
        { label: "Accounting package", value: "q_accounting_package" },
        { label: "Accounting Other warning?", value: "q_accounting_other_warning" },
        { label: "Avg jobs per month", value: "q_avg_jobs" },
        { label: "Templates needed", value: "q_templates" },
        { label: "Checklist needed?", value: "q_checklist" },
        { label: "Checklist examples", value: "q_checklist_examples" },
        { label: "Forms needed?", value: "q_forms" },
        { label: "Forms examples", value: "q_forms_examples" },
        { label: "Special features", value: (row) => row.q_special_features ? JSON.parse(row.q_special_features).join(", ") : ""},
        { label: "Proposed plan", value: "q_plan" },
        { label: "Explained plans?", value: "q_explained_plans" },
        { label: "Plan notes", value: "q_plan_notes" },
        { label: "Training preference", value: "q_training" },
        { label: "Other notes", value: "q_other_notes" },

        { label: "Notes", value: "notes" },
        { label: "Created At", value: (row) => cleanDate(row.created_at) },
        { label: "Updated At", value: (row) => cleanDate(row.updated_at) },
      ];

      const parser = new Parser({ fields, excelStrings: false });
      const csv = parser.parse(jobs);
      const filename = `jobs_export_${sm8_account_uuid}_${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.csv`;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.status(200).send(csv);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = jobController;