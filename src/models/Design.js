const pool = require("../config/db");

class Design {
  static COLUMNS = [
    "q_designs_ask_old_invoice",
    "q_designs_ask_terms",
    "q_designs_send_designer_info",
    "q_designs_send_proposals",
    "q_designs_client_chosen",
    "q_designs_upload_headers",
    "q_designs_upload_chosen",
    "q_designs_templates_created",
    "q_designs_templates_sent",
    "q_designs_templates_uploaded",
    "q_designs_more_notes",
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
    const query = `INSERT INTO design (${cols.join(',')}) VALUES (${placeholders})`;
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
      INSERT INTO design (${cols.join(',')})
      VALUES (${cols.map(() => '?').join(',')})
      ON DUPLICATE KEY UPDATE ${updates}
    `;
    await connection.query(query, values);
  }

  static async findByJobUuid(job_uuid) {
    const [rows] = await pool.query("SELECT * FROM design WHERE job_uuid = ?", [job_uuid]);
    if (rows.length === 0) return null;
    return rows[0];
  }
}

module.exports = Design;