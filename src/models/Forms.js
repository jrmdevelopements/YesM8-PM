const pool = require("../config/db");

class Forms {
  static COLUMNS = [
    "q_forms_jsa_rebranded",
    "q_forms_swms_rebranded",
    "q_forms_service_report_rebranded",
    "q_forms_jsa_added",
    "q_forms_swms_added",
    "q_forms_service_report_added",
    "q_forms_more_notes",
  ];

  static JSON_FIELDS = [];

  static async create(job_uuid, data, connection) {
    const row = {};
    for (const col of this.COLUMNS) {
      if (data[col] !== undefined) {
        let val = data[col];
        if (
          this.JSON_FIELDS.includes(col) &&
          val !== null &&
          val !== undefined
        ) {
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
    const query = `INSERT INTO forms (${cols.join(",")}) VALUES (${placeholders})`;
    await connection.query(query, values);
  }

  static async update(job_uuid, data, connection) {
    const row = {};
    for (const col of this.COLUMNS) {
      if (data[col] !== undefined) {
        let val = data[col];
        if (
          this.JSON_FIELDS.includes(col) &&
          val !== null &&
          val !== undefined
        ) {
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
      INSERT INTO forms (${cols.join(",")})
      VALUES (${cols.map(() => "?").join(",")})
      ON DUPLICATE KEY UPDATE ${updates}
    `;
    await connection.query(query, values);
  }

  static async findByJobUuid(job_uuid) {
    const [rows] = await pool.query("SELECT * FROM forms WHERE job_uuid = ?", [
      job_uuid,
    ]);
    if (rows.length === 0) return null;
    return rows[0];
  }
}

module.exports = Forms;
