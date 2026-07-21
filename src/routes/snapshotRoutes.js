// routes/snapshotRoutes.js
const express = require("express");
const router = express.Router();
const snapshotController = require("../controllers/snapshotController");

// Get all snapshots
router.get("/snapshots", snapshotController.getAllSnapshots);

// Get progress statistics
router.get("/snapshots/progress", snapshotController.getProgressStats);

// Get dashboard summary for an account
router.get("/snapshots/dashboard/:sm8_account_uuid", snapshotController.getDashboardSummary);

// Get snapshots by account
router.get("/snapshots/account/:sm8_account_uuid", snapshotController.getSnapshotsByAccount);

// Export snapshots to CSV (optional account filter)
router.get("/snapshots/export/:sm8_account_uuid?", snapshotController.exportSnapshotsToCSV);

// Get single snapshot (must be last to avoid conflicts)
router.get("/snapshots/:job_uuid", snapshotController.getSnapshot);

module.exports = router;