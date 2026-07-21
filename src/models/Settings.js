const pool = require("../config/db");

class Settings {
  static COLUMNS = [
    // Preferences
    "q_settings_upload_logo",
    "q_settings_company_info",
    "q_settings_tax_settings",
    "q_settings_email_settings",
    "q_settings_tasks",
    "q_settings_region_languages",
    "q_settings_notification",
    "q_settings_job_settings",
    "q_settings_invoicing",
    "q_settings_job_settings2",
    "q_settings_public_holiday",
    "q_settings_staff_leave",
    "q_settings_sm8_14",
    // Staff Members / Roles
    "q_settings_staff_accounts",
    "q_settings_labour_rates",
    "q_settings_security_roles",
    // Categories
    "q_settings_categories",
    // Queues
    "q_settings_create_queues",
    "q_settings_admin_invoice",
    "q_settings_admin_reschedule",
    "q_settings_notes",
    // Add‑Ons
    "q_settings_automation",
    "q_settings_customer_feedback",
    "q_settings_feedback_google_link",
    "q_settings_recurring_jobs",
    "q_settings_simple_enquiry_form",
    "q_settings_track_my_arrival",
    "q_settings_badges",
    "q_settings_job_templates",
    "q_settings_job_allocations",
    "q_settings_partial_invoicing",
    "q_settings_forms",
    "q_settings_assets",
    "q_settings_deputy",
    "q_settings_mailchimp",
    "q_settings_servicem8_network",
    "q_settings_external_calendars",
    "q_settings_calendar_import",
    "q_settings_two_way_email",
    "q_settings_advance_reporting_pack",
    "q_settings_self_serve_online_booking",
    "q_settings_services",
    "q_settings_margin_billing",
    "q_settings_job_costing",
    "q_settings_proposals",
    "q_settings_servicem8_phone",
    "q_settings_client_sites",
    "q_settings_bundles",
    "q_settings_addon_more_notes",
  ];

  static JSON_FIELDS = [];

  static async create(job_uuid, data, connection) {
    const row = {};
    for (const col of this.COLUMNS) {
      if (data[col] !== undefined) {
        let val = data[col];
        if (this.JSON_FIELDS.includes(col) && val !== null && val !== undefined) {
          val = JSON.stringify(val);
        }
        row[col] = val;
      }
    }
    if (Object.keys(row).length === 0) return;
    row.job_uuid = job_uuid;
    const cols = Object.keys(row);
    const placeholders = cols.map(() => "?").join(",");
    const values = cols.map((c) => row[c]);
    const query = `INSERT INTO settings (${cols.join(",")}) VALUES (${placeholders})`;
    await connection.query(query, values);
  }

  static async update(job_uuid, data, connection) {
    const row = {};
    for (const col of this.COLUMNS) {
      if (data[col] !== undefined) {
        let val = data[col];
        if (this.JSON_FIELDS.includes(col) && val !== null && val !== undefined) {
          val = JSON.stringify(val);
        }
        row[col] = val;
      }
    }
    if (Object.keys(row).length === 0) return;
    row.job_uuid = job_uuid;
    const cols = Object.keys(row);
    const values = cols.map((c) => row[c]);
    const updates = cols.map((c) => `${c} = VALUES(${c})`).join(", ");
    const query = `
      INSERT INTO settings (${cols.join(",")})
      VALUES (${cols.map(() => "?").join(",")})
      ON DUPLICATE KEY UPDATE ${updates}
    `;
    await connection.query(query, values);
  }

  static async findByJobUuid(job_uuid) {
    const [rows] = await pool.query("SELECT * FROM settings WHERE job_uuid = ?", [job_uuid]);
    if (rows.length === 0) return null;
    return rows[0];
  }
}

module.exports = Settings;