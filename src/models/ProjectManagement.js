const pool = require("../config/db");

class ProjectManagement {
  // All columns in project_management table (prestart + invoicing + refresher)
  static COLUMNS = [
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
    "q_rebate_approved_email_sent",
    "q_invoicing_initial_sent",
    "q_invoicing_initial_paid",
    "q_invoicing_progressive_sent",
    "q_invoicing_progressive_paid",
    "q_invoicing_final_sent",
    "q_invoicing_final_paid",
    "q_invoicing_notes",
    "q_refresher_call_organised",
    "q_refresher_call_notes",
  ];

  static JSON_FIELDS = []; // none

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