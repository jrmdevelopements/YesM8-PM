// models/Snapshot.js
const pool = require("../config/db");
const Discovery = require("./Discovery");
const ProjectManagement = require("./ProjectManagement");
const Design = require("./Design");
const Settings = require("./Settings");
const Templates = require("./Templates");
const Forms = require("./Forms");
const Accounts = require("./Accounts");

class Snapshot {
  // Fields that should be parsed as JSON
  static JSON_FIELDS = ["q_discovery_devices", "q_discovery_special_features"];

  /**
   * Get snapshot data for a specific job using JOIN
   */
  static async findByJobUuid(job_uuid) {
    const query = `
      SELECT 
        j.job_uuid,
        j.sm8_account_uuid,
        j.generated_job_id,
        j.created_at,
        j.updated_at,
        d.*,
        pm.*,
        de.*,
        s.*,
        t.*,
        f.*,
        a.*
      FROM jobs j
      LEFT JOIN discovery d ON d.job_uuid = j.job_uuid
      LEFT JOIN project_management pm ON pm.job_uuid = j.job_uuid
      LEFT JOIN design de ON de.job_uuid = j.job_uuid
      LEFT JOIN settings s ON s.job_uuid = j.job_uuid
      LEFT JOIN templates t ON t.job_uuid = j.job_uuid
      LEFT JOIN forms f ON f.job_uuid = j.job_uuid
      LEFT JOIN accounts a ON a.job_uuid = j.job_uuid
      WHERE j.job_uuid = ?
    `;
    
    const [rows] = await pool.query(query, [job_uuid]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    
    // Build snapshot with section data
    const snapshot = {
      job_uuid: row.job_uuid,
      sm8_account_uuid: row.sm8_account_uuid,
      generated_job_id: row.generated_job_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      
      // Extract section data based on model column definitions
      discovery: this.extractSectionData(row, Discovery.COLUMNS),
      projectManagement: this.extractSectionData(row, ProjectManagement.COLUMNS),
      design: this.extractSectionData(row, Design.COLUMNS),
      settings: this.extractSectionData(row, Settings.COLUMNS),
      templates: this.extractSectionData(row, Templates.COLUMNS),
      forms: this.extractSectionData(row, Forms.COLUMNS),
      accounts: this.extractSectionData(row, Accounts.COLUMNS),
    };
    
    // Parse JSON fields
    this.parseJSONFields(snapshot);
    
    // Calculate progress
    snapshot.progress = this.calculateAllProgress(snapshot);
    
    return snapshot;
  }

  /**
   * Extract section data from a row based on column names
   */
  static extractSectionData(row, columns) {
    const sectionData = {};
    let hasData = false;
    
    for (const col of columns) {
      if (row[col] !== undefined && row[col] !== null) {
        sectionData[col] = row[col];
        hasData = true;
      }
    }
    
    return hasData ? sectionData : null;
  }

  /**
   * Parse JSON fields in the snapshot
   */
  static parseJSONFields(snapshot) {
    for (const field of this.JSON_FIELDS) {
      if (snapshot.discovery && snapshot.discovery[field]) {
        try {
          snapshot.discovery[field] = JSON.parse(snapshot.discovery[field]);
        } catch (e) {}
      }
    }
  }

  /**
   * Get all snapshots with a single query
   */
  static async findAll() {
    const query = `
      SELECT 
        j.job_uuid,
        j.sm8_account_uuid,
        j.generated_job_id,
        j.created_at,
        j.updated_at,
        d.*,
        pm.*,
        de.*,
        s.*,
        t.*,
        f.*,
        a.*
      FROM jobs j
      LEFT JOIN discovery d ON d.job_uuid = j.job_uuid
      LEFT JOIN project_management pm ON pm.job_uuid = j.job_uuid
      LEFT JOIN design de ON de.job_uuid = j.job_uuid
      LEFT JOIN settings s ON s.job_uuid = j.job_uuid
      LEFT JOIN templates t ON t.job_uuid = j.job_uuid
      LEFT JOIN forms f ON f.job_uuid = j.job_uuid
      LEFT JOIN accounts a ON a.job_uuid = j.job_uuid
      ORDER BY j.created_at DESC
    `;
    
    const [rows] = await pool.query(query);
    
    // Group by job_uuid
    const jobMap = new Map();
    
    for (const row of rows) {
      const jobUuid = row.job_uuid;
      
      if (!jobMap.has(jobUuid)) {
        jobMap.set(jobUuid, {
          job_uuid: row.job_uuid,
          sm8_account_uuid: row.sm8_account_uuid,
          generated_job_id: row.generated_job_id,
          created_at: row.created_at,
          updated_at: row.updated_at,
          discovery: this.extractSectionData(row, Discovery.COLUMNS),
          projectManagement: this.extractSectionData(row, ProjectManagement.COLUMNS),
          design: this.extractSectionData(row, Design.COLUMNS),
          settings: this.extractSectionData(row, Settings.COLUMNS),
          templates: this.extractSectionData(row, Templates.COLUMNS),
          forms: this.extractSectionData(row, Forms.COLUMNS),
          accounts: this.extractSectionData(row, Accounts.COLUMNS),
        });
      }
    }
    
    // Parse JSON fields and calculate progress for each snapshot
    const snapshots = [];
    for (const [jobUuid, snapshot] of jobMap) {
      this.parseJSONFields(snapshot);
      snapshot.progress = this.calculateAllProgress(snapshot);
      snapshots.push(snapshot);
    }
    
    return snapshots;
  }

  /**
   * Get snapshots by account with a single query
   */
  static async findByAccount(sm8_account_uuid) {
    const query = `
      SELECT 
        j.job_uuid,
        j.sm8_account_uuid,
        j.generated_job_id,
        j.created_at,
        j.updated_at,
        d.*,
        pm.*,
        de.*,
        s.*,
        t.*,
        f.*,
        a.*
      FROM jobs j
      LEFT JOIN discovery d ON d.job_uuid = j.job_uuid
      LEFT JOIN project_management pm ON pm.job_uuid = j.job_uuid
      LEFT JOIN design de ON de.job_uuid = j.job_uuid
      LEFT JOIN settings s ON s.job_uuid = j.job_uuid
      LEFT JOIN templates t ON t.job_uuid = j.job_uuid
      LEFT JOIN forms f ON f.job_uuid = j.job_uuid
      LEFT JOIN accounts a ON a.job_uuid = j.job_uuid
      WHERE j.sm8_account_uuid = ?
      ORDER BY j.created_at DESC
    `;
    
    const [rows] = await pool.query(query, [sm8_account_uuid]);
    
    // Group by job_uuid
    const jobMap = new Map();
    
    for (const row of rows) {
      const jobUuid = row.job_uuid;
      
      if (!jobMap.has(jobUuid)) {
        jobMap.set(jobUuid, {
          job_uuid: row.job_uuid,
          sm8_account_uuid: row.sm8_account_uuid,
          generated_job_id: row.generated_job_id,
          created_at: row.created_at,
          updated_at: row.updated_at,
          discovery: this.extractSectionData(row, Discovery.COLUMNS),
          projectManagement: this.extractSectionData(row, ProjectManagement.COLUMNS),
          design: this.extractSectionData(row, Design.COLUMNS),
          settings: this.extractSectionData(row, Settings.COLUMNS),
          templates: this.extractSectionData(row, Templates.COLUMNS),
          forms: this.extractSectionData(row, Forms.COLUMNS),
          accounts: this.extractSectionData(row, Accounts.COLUMNS),
        });
      }
    }
    
    // Parse JSON fields and calculate progress for each snapshot
    const snapshots = [];
    for (const [jobUuid, snapshot] of jobMap) {
      this.parseJSONFields(snapshot);
      snapshot.progress = this.calculateAllProgress(snapshot);
      snapshots.push(snapshot);
    }
    
    return snapshots;
  }

  /**
   * Calculate progress for all sections
   */
  static calculateAllProgress(snapshot) {
    const progress = {
      overall: 0,
      sections: {}
    };

    // Define section field mappings for progress calculation
    const sections = {
      discovery: {
        data: snapshot.discovery,
        fields: [
          'q_discovery_what_after',
          'q_discovery_diff_app',
          'q_discovery_special_integration',
          'q_discovery_has_website',
          'q_discovery_website_form_link',
          'q_discovery_devices',
          'q_discovery_accounting_other_warning',
          'q_discovery_accounting_myob_warning',   // <-- NEW
          'q_discovery_staff_android',
          'q_discovery_android_limitation',
          'q_discovery_accounting',
          'q_discovery_accounting_package',
          'q_discovery_avg_jobs',
          'q_discovery_templates',
          'q_discovery_checklist',
          'q_discovery_forms',
          'q_discovery_special_features',
          'q_discovery_plan',
          'q_discovery_training',
        ]
      },
      projectManagement: {
        data: snapshot.projectManagement,
        fields: [
          'q_pm_directors_declaration',
          'q_pm_xero_agreement_sent',
          'q_pm_create_client_folder',
          'q_pm_upload_setup_google_sheet',
          'q_pm_upload_logo_client_folder',
          'q_pm_send_project_kickoff_email',
          'q_pm_plan_chosen',
          'q_pm_account_created',
          'q_pm_technical_discovery_call_setup',
          'q_pm_warranty_setup',
          'q_pm_sales_timesheet_added',
          'q_pm_google_review_sent',
          'q_pm_google_review_received',
          'q_pm_training_session_organised',
          'q_pm_rebate_applied_for',
          'q_pm_rebate_applied_email_sent',
          'q_pm_rebate_approved_email_sent',
          'q_pm_invoicing_initial_sent',
          'q_pm_invoicing_initial_paid',
          'q_pm_invoicing_progressive_sent',
          'q_pm_invoicing_progressive_paid',
          'q_pm_invoicing_final_sent',
          'q_pm_invoicing_final_paid',
          'q_pm_refresher_call_organised',
        ]
      },
      design: {
        data: snapshot.design,
        fields: [
          'q_designs_ask_old_invoice',
          'q_designs_ask_terms',
          'q_designs_send_designer_info',
          'q_designs_send_proposals',
          'q_designs_client_chosen',
          'q_designs_upload_headers',
          'q_designs_upload_chosen',
          'q_designs_templates_created',
          'q_designs_templates_sent',
          'q_designs_templates_uploaded',
        ]
      },
      settings: {
        data: snapshot.settings,
        fields: [
          'q_settings_upload_logo',
          'q_settings_company_info',
          'q_settings_tax_settings',
          'q_settings_email_settings',
          'q_settings_tasks',
          'q_settings_region_languages',
          'q_settings_notification',
          'q_settings_job_settings',
          'q_settings_invoicing',
          'q_settings_public_holiday',
          'q_settings_staff_leave',
          'q_settings_sm8_14',
          'q_settings_staff_accounts',
          'q_settings_labour_rates',
          'q_settings_security_roles',
          'q_settings_categories',
          'q_settings_create_queues',
          'q_settings_admin_invoice',
          'q_settings_admin_reschedule',
          'q_settings_automation',
          'q_settings_customer_feedback',
          'q_settings_recurring_jobs',
          'q_settings_simple_enquiry_form',
          'q_settings_track_my_arrival',
          'q_settings_badges',
          'q_settings_job_templates',
          'q_settings_job_allocations',
          'q_settings_partial_invoicing',
          'q_settings_forms',
          'q_settings_assets',
          'q_settings_deputy',
          'q_settings_mailchimp',
          'q_settings_servicem8_network',
          'q_settings_external_calendars',
          'q_settings_calendar_import',
          'q_settings_two_way_email',
          'q_settings_advance_reporting_pack',
          'q_settings_self_serve_online_booking',
          'q_settings_services',
          'q_settings_margin_billing',
          'q_settings_job_costing',
          'q_settings_proposals',
          'q_settings_servicem8_phone',
          'q_settings_client_sites',
          'q_settings_bundles',
        ]
      },
      templates: {
        data: snapshot.templates,
        fields: [
          'q_templates_parts_ordered_template',
          'q_templates_request_payment_template',
          'q_templates_sms_invoice',
          'q_templates_sms_quote',
          'q_templates_tech_delayed_template',
          'q_templates_overdue_payment_template',
          'q_templates_payment_demand_template',
          'q_templates_standard_invoice_template',
          'q_templates_standard_quote_template',
          'q_templates_customer_feedback',
          'q_templates_copy_invoice_template_from_default',
          'q_templates_create_invoice_based_on_quote',
          'q_templates_update_default_invoice_preferences',
          'q_templates_add_bank_details',
          'q_templates_add_discount_material',
          'q_templates_payment_followup_3_times',
          'q_templates_payment_followup_2_days_before',
          'q_templates_payment_followup_7_days_after',
          'q_templates_payment_followup_14_days_after',
          'q_templates_quote_followup_3_times',
          'q_templates_quote_followup_2_days_after',
          'q_templates_quote_followup_7_days_after',
          'q_templates_quote_followup_14_days_after',
          'q_templates_unsuccessful_after_30_days',
          'q_templates_update_booking_confirmation_email_text',
          'q_templates_update_booking_reminder_email_text',
        ]
      },
      forms: {
        data: snapshot.forms,
        fields: [
          'q_forms_jsa_rebranded',
          'q_forms_swms_rebranded',
          'q_forms_service_report_rebranded',
          'q_forms_jsa_added',
          'q_forms_swms_added',
          'q_forms_service_report_added',
        ]
      },
      accounts: {
        data: snapshot.accounts,
        fields: [
          'q_accounts_xero_integrated',
          'q_accounts_myob_integrated',
          'q_accounts_quickbooks_integrated',
          'q_accounts_stripe_account_created',
          'q_accounts_servicem8_pay_installed',
          'q_accounts_xero_email_sent',
          'q_accounts_xero_account_code_created',
          'q_accounts_servicem8_pay_settings_checked',
          'q_accounts_client_list_provided',
          'q_accounts_client_list_uploaded',
          'q_accounts_price_list_provided',
          'q_accounts_price_list_uploaded',
        ]
      }
    };

    let totalProgress = 0;
    let sectionCount = 0;

    for (const [sectionName, config] of Object.entries(sections)) {
      if (config.data) {
        const sectionProgress = this.calculateSectionProgress(config.data, config.fields);
        progress.sections[sectionName] = sectionProgress;
        totalProgress += sectionProgress;
        sectionCount++;
      }
    }

    progress.overall = sectionCount > 0 ? Math.round(totalProgress / sectionCount) : 0;
    
    return progress;
  }

  /**
   * Calculate progress for a single section
   */
  static calculateSectionProgress(sectionData, fieldNames) {
    let completed = 0;
    let total = 0;

    for (const field of fieldNames) {
      if (sectionData[field] !== undefined && sectionData[field] !== null) {
        total++;
        const value = sectionData[field];
        if (value === 'Completed' || value === 'N/A' || value === 'Yes') {
          completed++;
        } else if (value === 'In Progress') {
          completed += 0.5;
        }
      }
    }

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  /**
   * Get overall progress statistics
   */
  static async getProgressStats() {
    const snapshots = await this.findAll();
    
    const stats = {
      total_jobs: snapshots.length,
      completed: 0,
      in_progress: 0,
      started: 0,
      not_started: 0,
      average_progress: 0,
      total_accounts: 0,
    };

    let totalProgress = 0;
    const accountsSet = new Set();

    for (const snapshot of snapshots) {
      if (snapshot.sm8_account_uuid) {
        accountsSet.add(snapshot.sm8_account_uuid);
      }

      const progress = snapshot.progress?.overall || 0;
      totalProgress += progress;

      if (progress === 100) stats.completed++;
      else if (progress > 0 && progress < 100) stats.in_progress++;
      else if (progress > 0) stats.started++;
      else stats.not_started++;
    }

    stats.average_progress = snapshots.length > 0 
      ? Math.round(totalProgress / snapshots.length) 
      : 0;
    stats.total_accounts = accountsSet.size;

    // Add section-specific stats
    stats.section_stats = this.getSectionStats(snapshots);

    return stats;
  }

  /**
   * Get statistics for each section
   */
  static getSectionStats(snapshots) {
    const sections = ['discovery', 'projectManagement', 'design', 'settings', 'templates', 'forms', 'accounts'];
    const stats = {};

    for (const section of sections) {
      let total = 0;
      let completed = 0;
      let inProgress = 0;
      let notStarted = 0;

      for (const snapshot of snapshots) {
        const sectionData = snapshot[section];
        if (sectionData) {
          total++;
          const progress = snapshot.progress?.sections?.[section] || 0;
          if (progress === 100) completed++;
          else if (progress > 0) inProgress++;
          else notStarted++;
        }
      }

      stats[section] = {
        total,
        completed,
        in_progress: inProgress,
        not_started: notStarted,
        completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    }

    return stats;
  }
}

module.exports = Snapshot;