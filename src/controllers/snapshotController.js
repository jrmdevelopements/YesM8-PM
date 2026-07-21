// controllers/snapshotController.js
const Snapshot = require("../models/Snapshot");
const { AppError } = require("../utils/errorHandler");
const { Parser } = require("json2csv");

const snapshotController = {
  /**
   * Get snapshot for a specific job
   */
  async getSnapshot(req, res, next) {
    try {
      const { job_uuid } = req.params;
      const snapshot = await Snapshot.findByJobUuid(job_uuid);
      
      if (!snapshot) {
        throw new AppError("Snapshot not found", 404);
      }
      
      res.status(200).json({
        success: true,
        data: snapshot,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all snapshots
   */
  async getAllSnapshots(req, res, next) {
    try {
      const snapshots = await Snapshot.findAll();
      
      res.status(200).json({
        success: true,
        count: snapshots.length,
        data: snapshots,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get snapshots by account
   */
  async getSnapshotsByAccount(req, res, next) {
    try {
      const { sm8_account_uuid } = req.params;
      const snapshots = await Snapshot.findByAccount(sm8_account_uuid);
      
      res.status(200).json({
        success: true,
        count: snapshots.length,
        data: snapshots,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get overall progress statistics
   */
  async getProgressStats(req, res, next) {
    try {
      const stats = await Snapshot.getProgressStats();
      
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Export snapshots to CSV
   */
  async exportSnapshotsToCSV(req, res, next) {
    try {
      const { sm8_account_uuid } = req.params;
      let snapshots;

      if (sm8_account_uuid) {
        snapshots = await Snapshot.findByAccount(sm8_account_uuid);
      } else {
        snapshots = await Snapshot.findAll();
      }

      if (!snapshots || snapshots.length === 0) {
        throw new AppError("No snapshots found to export", 404);
      }

      // Flatten data for CSV
      const flattenedData = snapshots.map(snapshot => ({
        job_uuid: snapshot.job_uuid,
        sm8_account_uuid: snapshot.sm8_account_uuid,
        generated_job_id: snapshot.generated_job_id,
        overall_progress: snapshot.progress?.overall || 0,
        discovery_progress: snapshot.progress?.sections?.discovery || 0,
        pm_progress: snapshot.progress?.sections?.projectManagement || 0,
        design_progress: snapshot.progress?.sections?.design || 0,
        settings_progress: snapshot.progress?.sections?.settings || 0,
        templates_progress: snapshot.progress?.sections?.templates || 0,
        forms_progress: snapshot.progress?.sections?.forms || 0,
        accounts_progress: snapshot.progress?.sections?.accounts || 0,
        created_at: snapshot.created_at,
        updated_at: snapshot.updated_at,
        // Add key discovery fields for quick reference
        discovery_plan: snapshot.discovery?.q_discovery_plan || '',
        discovery_what_after: snapshot.discovery?.q_discovery_what_after || '',
        pm_account_created: snapshot.projectManagement?.q_pm_account_created || '',
        pm_plan_chosen: snapshot.projectManagement?.q_pm_plan_chosen || '',
        design_templates_created: snapshot.design?.q_designs_templates_created || '',
        accounts_xero_integrated: snapshot.accounts?.q_accounts_xero_integrated || '',
      }));

      const fields = Object.keys(flattenedData[0]);
      const parser = new Parser({ fields, excelStrings: true });
      const csv = parser.parse(flattenedData);

      const filename = `snapshots_export_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get dashboard summary for an account
   */
  async getDashboardSummary(req, res, next) {
    try {
      const { sm8_account_uuid } = req.params;
      const snapshots = await Snapshot.findByAccount(sm8_account_uuid);
      
      if (!snapshots || snapshots.length === 0) {
        throw new AppError("No jobs found for this account", 404);
      }

      // Calculate dashboard metrics
      const totalJobs = snapshots.length;
      const completed = snapshots.filter(s => s.progress?.overall === 100).length;
      const inProgress = snapshots.filter(s => s.progress?.overall > 0 && s.progress?.overall < 100).length;
      const notStarted = snapshots.filter(s => s.progress?.overall === 0).length;
      
      const avgProgress = totalJobs > 0 
        ? Math.round(snapshots.reduce((sum, s) => sum + (s.progress?.overall || 0), 0) / totalJobs)
        : 0;

      // Get section stats
      const sectionStats = Snapshot.getSectionStats(snapshots);

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentActivity = snapshots
        .filter(s => new Date(s.updated_at) >= sevenDaysAgo)
        .map(s => ({
          job_uuid: s.job_uuid,
          generated_job_id: s.generated_job_id,
          progress: s.progress?.overall || 0,
          updated_at: s.updated_at,
        }))
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

      // Get timeline data
      const timeline = snapshots
        .map(s => ({
          date: s.created_at,
          job_uuid: s.job_uuid,
          generated_job_id: s.generated_job_id,
          progress: s.progress?.overall || 0,
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      res.status(200).json({
        success: true,
        data: {
          total_jobs: totalJobs,
          completed,
          in_progress: inProgress,
          not_started: notStarted,
          average_progress: avgProgress,
          section_stats: sectionStats,
          recent_activity: recentActivity,
          timeline: timeline,
        }
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = snapshotController;