const Job = require("../models/Job");
const { Parser } = require("json2csv");

// ─── Helpers for CSV cleaning ──────────────────────────────
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

// ─── Controller methods ────────────────────────────────────

const jobController = {
  // Create a new job
  async createJob(req, res) {
    try {
      const jobData = req.body;
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

  // Get all jobs
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

  // Get job by UUID
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

  // Update job
  async updateJob(req, res) {
    try {
      const { job_uuid } = req.params;
      const jobData = req.body;
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

  // Delete job
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

  // Export jobs to CSV
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

      // Convert rows to plain objects
      jobs = jobs.map((job) => (job.toJSON ? job.toJSON() : job));

      // Define CSV fields – include discovery fields
      const fields = [
        { label: "Job UUID", value: "job_uuid" },
        { label: "Job Number", value: "job_number" },
        { label: "PO Number", value: "po_number" },
        { label: "Client Name", value: "client_name" },
        { label: "Job Address", value: "job_address" },
        { label: "Owner", value: "owner" },
        { label: "Trade Type", value: "tradetype" },
        { label: "Other Trade Type", value: "other_trade_type" },
        { label: "Sub Contractors", value: "sub_contractors" },

        {
          label: "Client Quote Request/WO/PO Received Date",
          value: (row) => cleanDate(row.client_wo_received_date),
        },
        {
          label: "Client Quote Request/WO/PO Received Time",
          value: (row) => cleanTime(row.client_wo_received_time) || "",
        },

        { label: "Status", value: "job_status" },
        { label: "Category", value: "job_category" },
        {
          label: "Job Created Date",
          value: (row) => cleanDate(row.job_created_date),
        },
        {
          label: "Job Created Time",
          value: (row) => cleanTime(row.job_created_time) || "",
        },
        {
          label: "Acknowledge Date",
          value: (row) => cleanDate(row.acknowledge_date),
        },
        {
          label: "Acknowledge Time",
          value: (row) => cleanTime(row.acknowledge_time) || "",
        },
        {
          label: "Quote Issued Date",
          value: (row) => cleanDate(row.quote_issued_date),
        },
        {
          label: "Quote Issued Time",
          value: (row) => cleanTime(row.quote_issued_time) || "",
        },
        {
          label: "Quote Approval Date",
          value: (row) => cleanDate(row.quote_approval_date),
        },
        {
          label: "Quote Approval Time",
          value: (row) => cleanTime(row.quote_approval_time) || "",
        },
        {
          label: "Target Start Date",
          value: (row) => cleanDate(row.target_start_date),
        },
        {
          label: "Target Start Time",
          value: (row) => cleanTime(row.target_start_time) || "",
        },
        {
          label: "Target Completion Date",
          value: (row) => cleanDate(row.target_completion_date),
        },
        {
          label: "Target Completion Time",
          value: (row) => cleanTime(row.target_completion_time) || "",
        },
        {
          label: "Actual Start Date",
          value: (row) => cleanDate(row.actual_start_date),
        },
        {
          label: "Actual Start Time",
          value: (row) => cleanTime(row.actual_start_time) || "",
        },
        {
          label: "Actual Completion Date",
          value: (row) => cleanDate(row.actual_completion_date) || "",
        },
        {
          label: "Actual Completion Time",
          value: (row) => cleanTime(row.actual_completion_time) || "",
        },
        {
          label: "Work Completion Date",
          value: (row) => cleanDate(row.work_completion_date) || "",
        },
        {
          label: "Work Completion Time",
          value: (row) => cleanTime(row.work_completion_time) || "",
        },

        { label: "Hold Point Reason", value: "hold_point_reason" },
        { label: "Hold Point On", value: (row) => cleanDate(row.hold_point_on) || "" },
        { label: "Hold Point Off", value: (row) => cleanDate(row.hold_point_off) || "" },

        { label: "Reason for Extension", value: "extension_reason" },
        { label: "Cause of Extension", value: "extension_cause" },
        {
          label: "Extension Request Date",
          value: (row) => cleanDate(row.extension_request_date),
        },
        {
          label: "Extension Request Time",
          value: (row) => cleanTime(row.extension_start_time) || "",
        },
        { label: "Extension Status", value: "extension_status" },
        {
          label: "Revised Completion Date",
          value: (row) => cleanDate(row.revised_completion_date),
        },
        {
          label: "Revised Completion Time",
          value: (row) => cleanTime(row.revised_completion_time) || "",
        },

        { label: "Invoice Issued Date", value: (row) => cleanDate(row.invoice_issued_date) },
        { label: "Invoice Paid Date", value: (row) => cleanDate(row.invoice_paid_date) },

        {
          label: "Cost Savings / Discounts Provided",
          value: "cost_saving_discount_provided",
        },
        {
          label: "Cost Savings / Discounts Provided Date",
          value: (row) => cleanDate(row.cost_saving_discount_provided_date),
        },
        {
          label: "Cost Savings / Discounts Provided Amount",
          value: "cost_saving_discount_provided_amount",
        },

        { label: "Escalation", value: "escalation" },
        { label: "Escalation Date", value: (row) => cleanDate(row.escalation_date) },
        {
          label: "Oban Escalation Response Date",
          value: (row) => cleanDate(row.oban_escalation_response_date),
        },
        { label: "Escalation Outcome", value: "escalation_outcomes" },
        { label: "Quality Assessment Completed", value: "quality_assessment_completed" },
        { label: "Quality Assessment Outcome", value: "quality_assessment_outcome" },

        { label: "Defects Liability End Date", value: (row) => cleanDate(row.defects_end_date) },
        { label: "Warranty End Date", value: (row) => cleanDate(row.warranty_end_date) },

        // ── Discovery fields ──
        { label: "What are you after?", value: "what_after" },
        { label: "Different app?", value: "diff_app" },
        { label: "Different app details", value: "diff_app_details" },
        { label: "Special integration?", value: "special_integration" },
        { label: "Has website?", value: "has_website" },
        { label: "Website address", value: "website_address" },
        { label: "Website form link?", value: "website_form_link" },
        { label: "Devices", value: (row) => (row.devices ? JSON.parse(row.devices).join(", ") : "") },
        { label: "Staff using Android?", value: "staff_android" },
        { label: "Android limitation noted?", value: "android_limitation" },
        { label: "Accounting package needed?", value: "accounting" },
        { label: "Accounting package", value: "accounting_package" },
        { label: "Accounting Other warning?", value: "accounting_other_warning" },
        { label: "Avg jobs per month", value: "avg_jobs" },
        { label: "Templates needed", value: "templates" },
        { label: "Checklist needed?", value: "checklist" },
        { label: "Checklist examples", value: "checklist_examples" },
        { label: "Forms needed?", value: "forms" },
        { label: "Forms examples", value: "forms_examples" },
        { label: "Special features", value: (row) =>
            row.special_features ? JSON.parse(row.special_features).join(", ") : ""
        },
        { label: "Proposed plan", value: "plan" },
        { label: "Explained plans?", value: "explained_plans" },
        { label: "Plan notes", value: "plan_notes" },
        { label: "Training preference", value: "training" },
        { label: "Other notes", value: "other_notes" },

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