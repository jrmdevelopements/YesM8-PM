const pool = require("../config/db");

class Discovery {
  static COLUMNS = [
    "q_discovery_what_after",
    "q_discovery_diff_app",
    "q_discovery_diff_app_details",
    "q_discovery_avg_jobs",
    "q_discovery_templates",
    "q_discovery_has_website",
    "q_discovery_website_address",
    "q_discovery_website_form_link",
    "q_discovery_special_integration",
    "q_discovery_integration_requirements",
    "q_discovery_devices",
    "q_discovery_staff_android",
    "q_discovery_android_limitation",
    "q_discovery_accounting",
    "q_discovery_accounting_package",
    "q_discovery_accounting_other_warning",
    "q_discovery_checklist",
    "q_discovery_checklist_examples",
    "q_discovery_forms",
    "q_discovery_forms_examples",
    "q_discovery_plan",
    "q_discovery_explained_plans",
    "q_discovery_plan_notes",
    "q_discovery_training",
    "q_discovery_special_features",
    "q_discovery_other_notes",
  ];

  static JSON_FIELDS = ["q_discovery_devices", "q_discovery_special_features"];

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
    const query = `INSERT INTO discovery (${cols.join(',')}) VALUES (${placeholders})`;
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
      INSERT INTO discovery (${cols.join(',')})
      VALUES (${cols.map(() => '?').join(',')})
      ON DUPLICATE KEY UPDATE ${updates}
    `;
    await connection.query(query, values);
  }

  static async findByJobUuid(job_uuid) {
    const [rows] = await pool.query("SELECT * FROM discovery WHERE job_uuid = ?", [job_uuid]);
    if (rows.length === 0) return null;
    const row = rows[0];
    for (const field of this.JSON_FIELDS) {
      if (row[field]) {
        try { row[field] = JSON.parse(row[field]); } catch (e) {}
      }
    }
    return row;
  }
}

module.exports = Discovery;