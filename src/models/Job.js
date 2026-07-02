const pool = require("../config/db");

class Job {
  // List of all database columns (except auto-generated id, created_at, updated_at)
  // We'll use this to build INSERT and UPDATE queries dynamically.
  static DB_COLUMNS = [
    "sm8_account_uuid",
    "job_uuid",
    "generated_job_id",
    "notes",
    "q_what_after",
    "q_diff_app",
    "q_diff_app_details",
    "q_special_integration",
     "q_integration_requirements",    // ✅ new
    "q_has_website",
    "q_website_address",
    "q_website_form_link",
    "q_devices",
    "q_staff_android",
    "q_android_limitation",
    "q_accounting",
    "q_accounting_package",
    "q_accounting_other_warning",
    "q_avg_jobs",
    "q_templates",
    "q_checklist",
    "q_checklist_examples",
    "q_forms",
    "q_forms_examples",
    "q_special_features",
    "q_plan",
    "q_explained_plans",
    "q_plan_notes",
    "q_training",
    "q_other_notes",
    "q_directors_declaration",
    "q_xero_agreement_sent",
    "q_create_client_folder",
    "q_upload_setup_google_sheet",
    "q_upload_logo_client_folder",
    "q_send_project_kickoff_email",
    "q_plan_chosen",
    "q_account_created",
    "q_account_owners_login_details",
    "q_technical_discovery_call_setup",
    "q_warranty_setup",
    "q_sales_timesheet_added",
    "q_google_review_sent",
    "q_google_review_received",
    "q_training_session_organised",
    "q_training_session_notes",
    "q_rebate_applied_for",
    "q_rebate_applied_email_sent",
    "q_rebate_approved_email_sent"
  ];

  // Map internal snake_case keys (from controller) to DB column names
  static internalToDbMap = {
    sm8_account_uuid: "sm8_account_uuid",
    job_uuid: "job_uuid",
    generated_job_id: "generated_job_id",
    notes: "notes",
    what_after: "q_what_after",
    diff_app: "q_diff_app",
    diff_app_details: "q_diff_app_details",
    special_integration: "q_special_integration",
    integration_requirements: "q_integration_requirements",   // ✅   // ✅ new
    has_website: "q_has_website",
    website_address: "q_website_address",
    website_form_link: "q_website_form_link",
    devices: "q_devices",
    staff_android: "q_staff_android",
    android_limitation: "q_android_limitation",
    accounting: "q_accounting",
    accounting_package: "q_accounting_package",
    accounting_other_warning: "q_accounting_other_warning",
    avg_jobs: "q_avg_jobs",
    templates: "q_templates",
    checklist: "q_checklist",
    checklist_examples: "q_checklist_examples",
    forms: "q_forms",
    forms_examples: "q_forms_examples",
    special_features: "q_special_features",
    plan: "q_plan",
    explained_plans: "q_explained_plans",
    plan_notes: "q_plan_notes",
    training: "q_training",
    other_notes: "q_other_notes",
    directors_declaration: "q_directors_declaration",
    xero_agreement_sent: "q_xero_agreement_sent",
    create_client_folder: "q_create_client_folder",
    upload_setup_google_sheet: "q_upload_setup_google_sheet",
    upload_logo_client_folder: "q_upload_logo_client_folder",
    send_project_kickoff_email: "q_send_project_kickoff_email",
    plan_chosen: "q_plan_chosen",
    account_created: "q_account_created",
    account_owners_login_details: "q_account_owners_login_details",
    technical_discovery_call_setup: "q_technical_discovery_call_setup",
    warranty_setup: "q_warranty_setup",
    sales_timesheet_added: "q_sales_timesheet_added",
    google_review_sent: "q_google_review_sent",
    google_review_received: "q_google_review_received",
    training_session_organised: "q_training_session_organised",
    training_session_notes: "q_training_session_notes",
    rebate_applied_for: "q_rebate_applied_for",
    rebate_applied_email_sent: "q_rebate_applied_email_sent",
    rebate_approved_email_sent: "q_rebate_approved_email_sent"
  };

  // JSON fields that need stringify/parse
  static JSON_FIELDS = ["q_devices", "q_special_features"];

  static async create(jobData) {
    // Build column list and values using the mapping
    const columns = [];
    const placeholders = [];
    const values = [];

    for (const [internalKey, dbColumn] of Object.entries(this.internalToDbMap)) {
      if (jobData[internalKey] !== undefined) {
        columns.push(dbColumn);
        placeholders.push("?");
        let val = jobData[internalKey];
        // Stringify JSON fields
        if (this.JSON_FIELDS.includes(dbColumn) && val !== null && val !== undefined) {
          val = JSON.stringify(val);
        }
        values.push(val);
      }
    }

    if (columns.length === 0) {
      throw new Error("No data provided to create job");
    }

    const query = `
      INSERT INTO jobs (${columns.join(", ")})
      VALUES (${placeholders.join(", ")})
    `;

    const [result] = await pool.query(query, values);
    return await this.findByUuid(jobData.job_uuid);
  }

  static async findByUuid(job_uuid) {
    const [rows] = await pool.query("SELECT * FROM jobs WHERE job_uuid = ?", [job_uuid]);
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await pool.query("SELECT * FROM jobs ORDER BY created_at DESC");
    return rows;
  }

  static async findByAccount(sm8_account_uuid) {
    const [rows] = await pool.query(
      "SELECT * FROM jobs WHERE sm8_account_uuid = ? ORDER BY created_at DESC",
      [sm8_account_uuid]
    );
    return rows;
  }

  static async findByAccountAndDateRange(sm8_account_uuid, start_date, end_date) {
    const [rows] = await pool.query(
      `SELECT * FROM jobs
       WHERE sm8_account_uuid = ?
         AND DATE(created_at) BETWEEN ? AND ?
       ORDER BY created_at DESC`,
      [sm8_account_uuid, start_date, end_date]
    );
    return rows;
  }

  static async update(job_uuid, jobData) {
    const updates = [];
    const values = [];

    for (const [internalKey, dbColumn] of Object.entries(this.internalToDbMap)) {
      if (jobData[internalKey] !== undefined) {
        let val = jobData[internalKey];
        // Stringify JSON fields
        if (this.JSON_FIELDS.includes(dbColumn) && val !== null && val !== undefined) {
          val = JSON.stringify(val);
        }
        updates.push(`${dbColumn} = ?`);
        values.push(val);
      }
    }

    if (updates.length === 0) {
      throw new Error("No fields to update");
    }

    // Add updated_at
    updates.push("updated_at = NOW()");
    values.push(job_uuid);

    const query = `
      UPDATE jobs
      SET ${updates.join(", ")}
      WHERE job_uuid = ?
    `;

    const [result] = await pool.query(query, values);
    if (result.affectedRows === 0) return null;
    return await this.findByUuid(job_uuid);
  }

  static async delete(job_uuid) {
    const job = await this.findByUuid(job_uuid);
    if (!job) return null;

    await pool.query("DELETE FROM jobs WHERE job_uuid = ?", [job_uuid]);
    return job;
  }
}

module.exports = Job;