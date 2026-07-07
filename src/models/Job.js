const pool = require("../config/db");

class Job {
  // Mapping: DB column -> target table
  static TABLE_MAP = {
    // Base jobs table
    sm8_account_uuid: 'jobs',
    job_uuid: 'jobs',
    generated_job_id: 'jobs',
    notes: 'jobs',
    // Discovery
    q_what_after: 'discovery',
    q_diff_app: 'discovery',
    q_diff_app_details: 'discovery',
    q_special_integration: 'discovery',
    q_integration_requirements: 'discovery',
    q_has_website: 'discovery',
    q_website_address: 'discovery',
    q_website_form_link: 'discovery',
    q_devices: 'discovery',
    q_staff_android: 'discovery',
    q_android_limitation: 'discovery',
    q_accounting: 'discovery',
    q_accounting_package: 'discovery',
    q_accounting_other_warning: 'discovery',
    q_avg_jobs: 'discovery',
    q_templates: 'discovery',
    q_checklist: 'discovery',
    q_checklist_examples: 'discovery',
    q_forms: 'discovery',
    q_forms_examples: 'discovery',
    q_special_features: 'discovery',
    q_plan: 'discovery',
    q_explained_plans: 'discovery',
    q_plan_notes: 'discovery',
    q_training: 'discovery',
    q_other_notes: 'discovery',
    // Prestart
    q_directors_declaration: 'prestart',
    q_xero_agreement_sent: 'prestart',
    q_create_client_folder: 'prestart',
    q_upload_setup_google_sheet: 'prestart',
    q_upload_logo_client_folder: 'prestart',
    q_send_project_kickoff_email: 'prestart',
    q_plan_chosen: 'prestart',
    q_account_created: 'prestart',
    q_account_owners_login_details: 'prestart',
    q_technical_discovery_call_setup: 'prestart',
    q_warranty_setup: 'prestart',
    q_sales_timesheet_added: 'prestart',
    q_google_review_sent: 'prestart',
    q_google_review_received: 'prestart',
    q_training_session_organised: 'prestart',
    q_training_session_notes: 'prestart',
    q_rebate_applied_for: 'prestart',
    q_rebate_applied_email_sent: 'prestart',
    q_rebate_approved_email_sent: 'prestart',
    // Design
    q_design_ask_old_invoice: 'design',
    q_design_ask_terms: 'design',
    q_design_send_designer_info: 'design',
    q_design_send_proposals: 'design',
    q_design_client_chosen: 'design',
    q_design_upload_headers: 'design',
    q_design_upload_chosen: 'design',
    q_design_templates_created: 'design',
    q_design_templates_sent: 'design',
    q_design_templates_uploaded: 'design',
    q_design_more_notes: 'design',
    // Settings
    q_settings_upload_logo: 'settings',
    q_settings_company_info: 'settings',
    q_settings_tax_settings: 'settings',
    q_settings_email_settings: 'settings',
    q_settings_tasks: 'settings',
    q_settings_region_languages: 'settings',
    q_settings_notification: 'settings',
    q_settings_job_settings: 'settings',
    q_settings_invoicing: 'settings',
    q_settings_job_settings2: 'settings',
    q_settings_public_holiday: 'settings',
    q_settings_staff_leave: 'settings',
    q_settings_sm8_14: 'settings',
    q_settings_staff_accounts: 'settings',
    q_settings_labour_rates: 'settings',
    q_settings_security_roles: 'settings',
    q_settings_categories: 'settings',
    q_settings_create_queues: 'settings',
    q_settings_admin_invoice: 'settings',
    q_settings_admin_reschedule: 'settings',
    q_settings_notes: 'settings',
  };

  // Map camelCase request keys to snake_case DB columns (unchanged)
  static internalToDbMap = {
    sm8_account_uuid: "sm8_account_uuid",
    job_uuid: "job_uuid",
    generated_job_id: "generated_job_id",
    notes: "notes",
    what_after: "q_what_after",
    diff_app: "q_diff_app",
    diff_app_details: "q_diff_app_details",
    special_integration: "q_special_integration",
    integration_requirements: "q_integration_requirements",
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
    rebate_approved_email_sent: "q_rebate_approved_email_sent",
    design_ask_old_invoice: "q_design_ask_old_invoice",
    design_ask_terms: "q_design_ask_terms",
    design_send_designer_info: "q_design_send_designer_info",
    design_send_proposals: "q_design_send_proposals",
    design_client_chosen: "q_design_client_chosen",
    design_upload_headers: "q_design_upload_headers",
    design_upload_chosen: "q_design_upload_chosen",
    design_templates_created: "q_design_templates_created",
    design_templates_sent: "q_design_templates_sent",
    design_templates_uploaded: "q_design_templates_uploaded",
    design_more_notes: "q_design_more_notes",
    settings_upload_logo: "q_settings_upload_logo",
    settings_company_info: "q_settings_company_info",
    settings_tax_settings: "q_settings_tax_settings",
    settings_email_settings: "q_settings_email_settings",
    settings_tasks: "q_settings_tasks",
    settings_region_languages: "q_settings_region_languages",
    settings_notification: "q_settings_notification",
    settings_job_settings: "q_settings_job_settings",
    settings_invoicing: "q_settings_invoicing",
    settings_job_settings2: "q_settings_job_settings2",
    settings_public_holiday: "q_settings_public_holiday",
    settings_staff_leave: "q_settings_staff_leave",
    settings_sm8_14: "q_settings_sm8_14",
    settings_staff_accounts: "q_settings_staff_accounts",
    settings_labour_rates: "q_settings_labour_rates",
    settings_security_roles: "q_settings_security_roles",
    settings_categories: "q_settings_categories",
    settings_create_queues: "q_settings_create_queues",
    settings_admin_invoice: "q_settings_admin_invoice",
    settings_admin_reschedule: "q_settings_admin_reschedule",
    settings_notes: "q_settings_notes",
  };

  // JSON fields that need stringify/parse
  static JSON_FIELDS = ["q_devices", "q_special_features"];

  // --- Helper: split data by table ---
  static splitDataByTable(data) {
    const grouped = {};
    for (const [key, table] of Object.entries(this.TABLE_MAP)) {
      if (data[key] !== undefined) {
        if (!grouped[table]) grouped[table] = {};
        let val = data[key];
        if (this.JSON_FIELDS.includes(key) && val !== null && val !== undefined) {
          val = JSON.stringify(val);
        }
        grouped[table][key] = val;
      }
    }
    return grouped;
  }

  // --- CREATE ---
  static async create(jobData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insert base jobs row
      const baseCols = ['job_uuid', 'sm8_account_uuid', 'generated_job_id', 'notes'];
      const baseVals = baseCols.map(c => jobData[c]);
      const baseQuery = `INSERT INTO jobs (${baseCols.join(',')}) VALUES (${baseCols.map(() => '?').join(',')})`;
      await connection.query(baseQuery, baseVals);

      // 2. Insert child tables
      const grouped = this.splitDataByTable(jobData);
      // Remove 'jobs' from grouped to avoid inserting into jobs again
      delete grouped.jobs;

      for (const [table, row] of Object.entries(grouped)) {
        // Always include job_uuid
        row.job_uuid = jobData.job_uuid;
        const cols = Object.keys(row);
        const placeholders = cols.map(() => '?').join(',');
        const values = cols.map(c => row[c]);
        const query = `INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders})`;
        await connection.query(query, values);
      }

      await connection.commit();
      return await this.findByUuid(jobData.job_uuid);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // --- FIND by UUID ---
  static async findByUuid(job_uuid) {
    const query = `
      SELECT j.*, d.*, p.*, de.*, s.*
      FROM jobs j
      LEFT JOIN discovery d ON j.job_uuid = d.job_uuid
      LEFT JOIN prestart p ON j.job_uuid = p.job_uuid
      LEFT JOIN design de ON j.job_uuid = de.job_uuid
      LEFT JOIN settings s ON j.job_uuid = s.job_uuid
      WHERE j.job_uuid = ?
    `;
    const [rows] = await pool.query(query, [job_uuid]);
    if (rows.length === 0) return null;
    const row = rows[0];
    // Parse JSON fields
    for (const field of this.JSON_FIELDS) {
      if (row[field]) {
        try { row[field] = JSON.parse(row[field]); } catch (e) {}
      }
    }
    return row;
  }

  // --- FIND ALL ---
  static async findAll() {
    const query = `
      SELECT j.*, d.*, p.*, de.*, s.*
      FROM jobs j
      LEFT JOIN discovery d ON j.job_uuid = d.job_uuid
      LEFT JOIN prestart p ON j.job_uuid = p.job_uuid
      LEFT JOIN design de ON j.job_uuid = de.job_uuid
      LEFT JOIN settings s ON j.job_uuid = s.job_uuid
      ORDER BY j.created_at DESC
    `;
    const [rows] = await pool.query(query);
    // Parse JSON fields for each row
    for (const row of rows) {
      for (const field of this.JSON_FIELDS) {
        if (row[field]) {
          try { row[field] = JSON.parse(row[field]); } catch (e) {}
        }
      }
    }
    return rows;
  }

  // --- FIND by Account ---
  static async findByAccount(sm8_account_uuid) {
    const query = `
      SELECT j.*, d.*, p.*, de.*, s.*
      FROM jobs j
      LEFT JOIN discovery d ON j.job_uuid = d.job_uuid
      LEFT JOIN prestart p ON j.job_uuid = p.job_uuid
      LEFT JOIN design de ON j.job_uuid = de.job_uuid
      LEFT JOIN settings s ON j.job_uuid = s.job_uuid
      WHERE j.sm8_account_uuid = ?
      ORDER BY j.created_at DESC
    `;
    const [rows] = await pool.query(query, [sm8_account_uuid]);
    for (const row of rows) {
      for (const field of this.JSON_FIELDS) {
        if (row[field]) {
          try { row[field] = JSON.parse(row[field]); } catch (e) {}
        }
      }
    }
    return rows;
  }

  // --- FIND by Account and Date Range ---
  static async findByAccountAndDateRange(sm8_account_uuid, start_date, end_date) {
    const query = `
      SELECT j.*, d.*, p.*, de.*, s.*
      FROM jobs j
      LEFT JOIN discovery d ON j.job_uuid = d.job_uuid
      LEFT JOIN prestart p ON j.job_uuid = p.job_uuid
      LEFT JOIN design de ON j.job_uuid = de.job_uuid
      LEFT JOIN settings s ON j.job_uuid = s.job_uuid
      WHERE j.sm8_account_uuid = ?
        AND DATE(j.created_at) BETWEEN ? AND ?
      ORDER BY j.created_at DESC
    `;
    const [rows] = await pool.query(query, [sm8_account_uuid, start_date, end_date]);
    for (const row of rows) {
      for (const field of this.JSON_FIELDS) {
        if (row[field]) {
          try { row[field] = JSON.parse(row[field]); } catch (e) {}
        }
      }
    }
    return rows;
  }

  // --- UPDATE (with upsert for child tables) ---
  static async update(job_uuid, jobData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Update base jobs table
      const baseCols = ['generated_job_id', 'notes'];
      const baseUpdates = [];
      const baseValues = [];
      for (const col of baseCols) {
        if (jobData[col] !== undefined) {
          baseUpdates.push(`${col} = ?`);
          baseValues.push(jobData[col]);
        }
      }
      if (baseUpdates.length > 0) {
        baseValues.push(job_uuid);
        await connection.query(
          `UPDATE jobs SET ${baseUpdates.join(', ')} WHERE job_uuid = ?`,
          baseValues
        );
      }

      // 2. Upsert child tables
      const grouped = this.splitDataByTable(jobData);
      delete grouped.jobs; // we already handled base

      for (const [table, row] of Object.entries(grouped)) {
        row.job_uuid = job_uuid;
        const cols = Object.keys(row);
        const values = cols.map(c => row[c]);
        // Build ON DUPLICATE KEY UPDATE clause
        const updates = cols.map(c => `${c} = VALUES(${c})`).join(', ');
        const query = `
          INSERT INTO ${table} (${cols.join(',')})
          VALUES (${cols.map(() => '?').join(',')})
          ON DUPLICATE KEY UPDATE ${updates}
        `;
        await connection.query(query, values);
      }

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
    await pool.query('DELETE FROM jobs WHERE job_uuid = ?', [job_uuid]);
    return job;
  }
}

module.exports = Job;