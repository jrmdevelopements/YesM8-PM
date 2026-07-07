const pool = require("../config/db");

class Accounts {
  static COLUMNS = [
    "q_xero_integrated",
    "q_myob_integrated",
    "q_quickbooks_integrated",
    "q_stripe_account_created",
    "q_servicem8_pay_installed",
    "q_xero_email_sent",
    "q_xero_account_code_created",
    "q_servicem8_pay_settings_checked",
    "q_client_list_provided",
    "q_client_list_uploaded",
    "q_price_list_provided",
    "q_price_list_uploaded",
    "q_data_import_notes",
    "q_accounts_more_notes",
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
    const query = `INSERT INTO accounts (${cols.join(',')}) VALUES (${placeholders})`;
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
      INSERT INTO accounts (${cols.join(',')})
      VALUES (${cols.map(() => '?').join(',')})
      ON DUPLICATE KEY UPDATE ${updates}
    `;
    await connection.query(query, values);
  }

  static async findByJobUuid(job_uuid) {
    const [rows] = await pool.query("SELECT * FROM accounts WHERE job_uuid = ?", [job_uuid]);
    if (rows.length === 0) return null;
    return rows[0];
  }
}

module.exports = Accounts;