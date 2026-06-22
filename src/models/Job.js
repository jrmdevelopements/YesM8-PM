const pool = require("../config/db");

class Job {
  // ─── CREATE ──────────────────────────────────────────────
  static async create(jobData) {
    const query = `
      INSERT INTO jobs (
        sm8_account_uuid, client_name, client_address, job_uuid, job_number, po_number,
        job_created_date, job_created_time, job_address, job_status, job_category,
        acknowledge_date, acknowledge_time,
        client_wo_received_date, client_wo_received_time,
        target_start_date, target_start_time,
        actual_start_date, actual_start_time,
        target_completion_date, target_completion_time,
        work_completion_date, work_completion_time,
        hold_point_on, hold_point_off, hold_point_reason,
        extension_status, extension_cause, extension_request_date, extension_start_time, revised_completion_date, revised_completion_time,
        defects_end_date, notes,
        owner, tradetype, other_trade_type, sub_contractors,
        quote_issued_date, quote_issued_time,
        quote_approval_date, quote_approval_time,
        actual_completion_date, actual_completion_time,
        extension_reason,
        invoice_issued_date, invoice_paid_date,
        cost_saving_discount_provided, cost_saving_discount_provided_date, cost_saving_discount_provided_amount,
        escalation, escalation_date, oban_escalation_response_date, escalation_outcomes,
        quality_assessment_completed, quality_assessment_outcome,
        warranty_end_date,
        -- Discovery fields
        what_after, diff_app, diff_app_details, special_integration,
        has_website, website_address, website_form_link,
        devices,
        staff_android, android_limitation,
        accounting, accounting_package, accounting_other_warning,
        avg_jobs, templates,
        checklist, checklist_examples,
        forms, forms_examples,
        special_features,
        plan, explained_plans, plan_notes,
        training, other_notes
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?,
        ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?,
        -- Discovery values
        ?, ?, ?, ?,
        ?, ?, ?,
        ?,
        ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?,
        ?, ?, ?,
        ?, ?
      )
    `;

    // Helper to stringify JSON arrays
    const jsonStringify = (val) => (val ? JSON.stringify(val) : null);

    const values = [
      jobData.sm8_account_uuid,
      jobData.client_name,
      jobData.client_address,
      jobData.job_uuid,
      jobData.job_number,
      jobData.po_number,
      jobData.job_created_date,
      jobData.job_created_time,
      jobData.job_address,
      jobData.job_status,
      jobData.job_category,
      jobData.acknowledge_date,
      jobData.acknowledge_time,
      jobData.client_wo_received_date,
      jobData.client_wo_received_time,
      jobData.target_start_date,
      jobData.target_start_time,
      jobData.actual_start_date,
      jobData.actual_start_time,
      jobData.target_completion_date,
      jobData.target_completion_time,
      jobData.work_completion_date,
      jobData.work_completion_time,
      jobData.hold_point_on,
      jobData.hold_point_off,
      jobData.hold_point_reason,
      jobData.extension_status,
      jobData.extension_cause,
      jobData.extension_request_date,
      jobData.extension_start_time,
      jobData.revised_completion_date,
      jobData.revised_completion_time,
      jobData.defects_end_date,
      jobData.notes,
      jobData.owner,
      jobData.tradetype,
      jobData.other_trade_type,
      jobData.sub_contractors,
      jobData.quote_issued_date,
      jobData.quote_issued_time,
      jobData.quote_approval_date,
      jobData.quote_approval_time,
      jobData.actual_completion_date,
      jobData.actual_completion_time,
      jobData.extension_reason,
      jobData.invoice_issued_date,
      jobData.invoice_paid_date,
      jobData.cost_saving_discount_provided,
      jobData.cost_saving_discount_provided_date,
      jobData.cost_saving_discount_provided_amount,
      jobData.escalation,
      jobData.escalation_date,
      jobData.oban_escalation_response_date,
      jobData.escalation_outcomes,
      jobData.quality_assessment_completed,
      jobData.quality_assessment_outcome,
      jobData.warranty_end_date,
      // Discovery values
      jobData.whatAfter,
      jobData.diffApp,
      jobData.diffAppDetails,
      jobData.specialIntegration,
      jobData.hasWebsite,
      jobData.websiteAddress,
      jobData.websiteFormLink,
      jsonStringify(jobData.devices),
      jobData.staffAndroid,
      jobData.androidLimitation,
      jobData.accounting,
      jobData.accountingPackage,
      jobData.accountingOtherWarning,
      jobData.avgJobs,
      jobData.templates,
      jobData.checklist,
      jobData.checklistExamples,
      jobData.forms,
      jobData.formsExamples,
      jsonStringify(jobData.specialFeatures),
      jobData.plan,
      jobData.explainedPlans,
      jobData.planNotes,
      jobData.training,
      jobData.otherNotes,
    ];

    const [result] = await pool.query(query, values);
    return await this.findByUuid(jobData.job_uuid);
  }

  // ─── FIND BY UUID ─────────────────────────────────────────
  static async findByUuid(job_uuid) {
    const [rows] = await pool.query("SELECT * FROM jobs WHERE job_uuid = ?", [
      job_uuid,
    ]);
    return rows[0] || null;
  }

  // ─── FIND ALL ─────────────────────────────────────────────
  static async findAll() {
    const [rows] = await pool.query(
      "SELECT * FROM jobs ORDER BY created_at DESC"
    );
    return rows;
  }

  // ─── FIND BY ACCOUNT ──────────────────────────────────────
  static async findByAccount(sm8_account_uuid) {
    const [rows] = await pool.query(
      "SELECT * FROM jobs WHERE sm8_account_uuid = ? ORDER BY created_at DESC",
      [sm8_account_uuid]
    );
    return rows;
  }

  // ─── FIND BY ACCOUNT + DATE RANGE ────────────────────────
  static async findByAccountAndDateRange(
    sm8_account_uuid,
    start_date,
    end_date
  ) {
    const [rows] = await pool.query(
      `SELECT * FROM jobs
       WHERE sm8_account_uuid = ?
         AND DATE(created_at) BETWEEN ? AND ?
       ORDER BY created_at DESC`,
      [sm8_account_uuid, start_date, end_date]
    );
    return rows;
  }

  // ─── UPDATE ───────────────────────────────────────────────
  static async update(job_uuid, jobData) {
    // Allowed fields – includes all columns (including discovery)
    const allowedFields = [
      "sm8_account_uuid",
      "client_name",
      "client_address",
      "job_number",
      "po_number",
      "job_address",
      "job_status",
      "job_category",
      "job_created_date",
      "job_created_time",
      "acknowledge_date",
      "acknowledge_time",
      "client_wo_received_date",
      "client_wo_received_time",
      "target_start_date",
      "target_start_time",
      "actual_start_date",
      "actual_start_time",
      "target_completion_date",
      "target_completion_time",
      "work_completion_date",
      "work_completion_time",
      "hold_point_on",
      "hold_point_off",
      "hold_point_reason",
      "extension_status",
      "extension_cause",
      "extension_request_date",
      "extension_start_time",
      "extension_reason",
      "revised_completion_date",
      "revised_completion_time",
      "defects_end_date",
      "notes",
      "owner",
      "tradetype",
      "other_trade_type",
      "sub_contractors",
      "quote_issued_date",
      "quote_issued_time",
      "quote_approval_date",
      "quote_approval_time",
      "actual_completion_date",
      "actual_completion_time",
      "invoice_issued_date",
      "invoice_paid_date",
      "cost_saving_discount_provided",
      "cost_saving_discount_provided_date",
      "cost_saving_discount_provided_amount",
      "escalation",
      "escalation_date",
      "oban_escalation_response_date",
      "escalation_outcomes",
      "quality_assessment_completed",
      "quality_assessment_outcome",
      "warranty_end_date",
      // Discovery fields
      "what_after",
      "diff_app",
      "diff_app_details",
      "special_integration",
      "has_website",
      "website_address",
      "website_form_link",
      "devices",
      "staff_android",
      "android_limitation",
      "accounting",
      "accounting_package",
      "accounting_other_warning",
      "avg_jobs",
      "templates",
      "checklist",
      "checklist_examples",
      "forms",
      "forms_examples",
      "special_features",
      "plan",
      "explained_plans",
      "plan_notes",
      "training",
      "other_notes",
    ];

    const fields = [];
    const values = [];
    const jsonFields = ["devices", "special_features"];

    allowedFields.forEach((field) => {
      // map frontend camelCase to DB snake_case
      let dbField = field;
      let value = jobData[field];
      if (value !== undefined) {
        // If it's a JSON field, stringify
        if (jsonFields.includes(dbField)) {
          value = value ? JSON.stringify(value) : null;
        }
        fields.push(`${dbField} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    fields.push("updated_at = NOW()");
    values.push(job_uuid);

    const query = `
      UPDATE jobs
      SET ${fields.join(", ")}
      WHERE job_uuid = ?
    `;

    const [result] = await pool.query(query, values);
    if (result.affectedRows === 0) return null;
    return await this.findByUuid(job_uuid);
  }

  // ─── DELETE ───────────────────────────────────────────────
  static async delete(job_uuid) {
    const job = await this.findByUuid(job_uuid);
    if (!job) return null;

    await pool.query("DELETE FROM jobs WHERE job_uuid = ?", [job_uuid]);
    return job;
  }
}

module.exports = Job;