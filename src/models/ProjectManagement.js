const pool = require("../config/db");

class ProjectManagement {
  static COLUMNS = [
    "q_pm_directors_declaration",
    "q_pm_xero_agreement_sent",
    "q_pm_create_client_folder",
    "q_pm_upload_setup_google_sheet",
    "q_pm_upload_logo_client_folder",
    "q_pm_send_project_kickoff_email",
    "q_pm_plan_chosen",
    "q_pm_account_created",
    "q_pm_account_owners_login_details",
    "q_pm_technical_discovery_call_setup",
    "q_pm_warranty_setup",
    "q_pm_sales_timesheet_added",
    "q_pm_google_review_sent",
    "q_pm_google_review_received",
    "q_pm_training_session_organised",
    "q_pm_training_session_notes",
    "q_pm_rebate_applied_for",
    "q_pm_rebate_applied_email_sent",
    "q_pm_rebate_approved_email_sent",
    "q_pm_invoicing_initial_sent",
    "q_pm_invoicing_initial_paid",
    "q_pm_invoicing_progressive_sent",
    "q_pm_invoicing_progressive_paid",
    "q_pm_invoicing_final_sent",
    "q_pm_invoicing_final_paid",
    "q_pm_invoicing_notes",
    "q_pm_refresher_call_organised",
    "q_pm_refresher_call_notes",
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
    const placeholders = cols.map(() => '?').join(',');
    const values = cols.map(c => row[c]);
    const query = `INSERT INTO project_management (${cols.join(',')}) VALUES (${placeholders})`;
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
    const values = cols.map(c => row[c]);
    const updates = cols.map(c => `${c} = VALUES(${c})`).join(', ');
    const query = `
      INSERT INTO project_management (${cols.join(',')})
      VALUES (${cols.map(() => '?').join(',')})
      ON DUPLICATE KEY UPDATE ${updates}
    `;
    await connection.query(query, values);
  }

  static async findByJobUuid(job_uuid) {
    const [rows] = await pool.query("SELECT * FROM project_management WHERE job_uuid = ?", [job_uuid]);
    if (rows.length === 0) return null;
    return rows[0];
  }
}

module.exports = ProjectManagement;