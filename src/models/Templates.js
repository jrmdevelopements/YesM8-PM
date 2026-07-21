const pool = require("../config/db");

class Templates {
  static COLUMNS = [
    // SMS Templates
    "q_templates_parts_ordered_template",
    "q_templates_request_payment_template",
    "q_templates_sms_invoice",
    "q_templates_sms_quote",
    "q_templates_tech_delayed_template",
    "q_templates_sms_more_notes",
    // Email Templates
    "q_templates_overdue_payment_template",
    "q_templates_payment_demand_template",
    "q_templates_standard_invoice_template",
    "q_templates_standard_quote_template",
    "q_templates_customer_feedback",
    "q_templates_email_more_notes",
    // Invoice Templates
    "q_templates_copy_invoice_template_from_default",
    "q_templates_create_invoice_based_on_quote",
    "q_templates_update_default_invoice_preferences",
    "q_templates_add_bank_details",
    "q_templates_add_discount_material",
    "q_templates_create_work_order_based_on_quote",
    // Automation Checklist
    "q_templates_payment_followup_3_times",
    "q_templates_payment_followup_2_days_before",
    "q_templates_payment_followup_7_days_after",
    "q_templates_payment_followup_14_days_after",
    "q_templates_payment_update_email_default_3rd_followup",
    "q_templates_payment_update_sms_default_3rd_followup",
    "q_templates_quote_followup_3_times",
    "q_templates_quote_followup_2_days_after",
    "q_templates_quote_followup_7_days_after",
    "q_templates_quote_followup_14_days_after",
    "q_templates_unsuccessful_after_30_days",
    "q_templates_update_booking_confirmation_email_text",
    "q_templates_update_booking_reminder_email_text",
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
    const query = `INSERT INTO templates (${cols.join(",")}) VALUES (${placeholders})`;
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
      INSERT INTO templates (${cols.join(",")})
      VALUES (${cols.map(() => "?").join(",")})
      ON DUPLICATE KEY UPDATE ${updates}
    `;
    await connection.query(query, values);
  }

  static async findByJobUuid(job_uuid) {
    const [rows] = await pool.query("SELECT * FROM templates WHERE job_uuid = ?", [job_uuid]);
    if (rows.length === 0) return null;
    return rows[0];
  }
}

module.exports = Templates;