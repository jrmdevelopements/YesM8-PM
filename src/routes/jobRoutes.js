const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const validateJob = require("../validators/validateJob");

router.post("/jobs", validateJob, jobController.createJob);
router.get("/jobs", jobController.getAllJobs);
router.get("/jobs/:job_uuid", jobController.getJobByUuid);
router.put("/jobs/:job_uuid", validateJob, jobController.updateJob);
router.delete("/jobs/:job_uuid", jobController.deleteJob);
router.get("/jobs/export/:sm8_account_uuid/csv", jobController.exportJobsToCSV);

module.exports = router;