const { body, validationResult } = require("express-validator");
const { AppError } = require("../utils/errorHandler");
const validateJob = [
  body("job_uuid").notEmpty().withMessage("job_uuid is required"),
  body("sm8_account_uuid")
    .notEmpty()
    .withMessage("sm8_account_uuid is required"),
  // Other standard fields
  body("generated_job_id").optional().isString(),
  body("notes").optional().isString(),

  // Discovery fields – enums and allowed values
  body("whatAfter").optional().isString(),
  body("diffApp").optional().isIn(["Yes", "No"]),
  body("diffAppDetails").optional().isString(),
  body("specialIntegration").optional().isIn(["Yes", "No"]),
  body("integrationRequirements").optional().isString(),
  body("hasWebsite").optional().isIn(["Yes", "No"]),
  body("websiteAddress").optional().isURL().withMessage("Must be a valid URL"),
  body("websiteFormLink").optional().isIn(["Yes", "No"]),
  body("devices").optional().isArray().withMessage("Devices must be an array"),
  body("staffAndroid").optional().isIn(["Yes", "No"]),
  body("androidLimitation").optional().isIn(["Yes", "No"]),
  body("accounting").optional().isIn(["Yes", "No"]),
  body("accountingPackage")
    .optional()
    .isIn(["Xero", "MYOB", "Quickbooks", "Other"]),
  body("accountingOtherWarning").optional().isIn(["Yes", "No"]),
  body("avgJobs")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Must be a positive integer"),
  body("templates").optional().isIn(["Invoice", "Quote", "Both"]),
  body("checklist").optional().isIn(["Yes", "No"]),
  body("checklistExamples").optional().isIn(["Yes", "No"]),
  body("forms").optional().isIn(["Yes", "No"]),
  body("formsExamples").optional().isIn(["Yes", "No"]),
  body("specialFeatures")
    .optional()
    .isArray()
    .withMessage("Special features must be an array"),
  body("plan")
    .optional()
    .isIn([
      "Starter - $29",
      "Growing - $79",
      "Premium - $149",
      "Premium Plus - $349",
    ]),
  body("explainedPlans").optional().isIn(["Yes", "No"]),
  body("planNotes").optional().isString(),
  body("training")
    .optional()
    .isIn(["Google meet", "Ellenbrook", "Client Premises", "Other"]),
  body("otherNotes").optional().isString(),
  // Prestart dropdowns (In Progress, Completed, N/A)
  body("directorsDeclaration")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("xeroAgreementSent")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("createClientFolder")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("uploadSetupGoogleSheet")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("uploadLogoClientFolder")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("sendProjectKickoffEmail")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("planChosen").optional().isIn(["In Progress", "Completed", "N/A"]),
  body("accountCreated").optional().isIn(["Yes", "No"]),
  body("accountOwnersLoginDetails").optional().isString(),
  body("technicalDiscoveryCallSetup").optional().isIn(["Yes", "No"]),
  body("warrantySetup").optional().isIn(["Yes", "No"]),
  body("salesTimesheetAdded").optional().isIn(["Yes", "No", "N/A"]),
  body("googleReviewSent").optional().isIn(["Yes", "No", "N/A"]),
  body("googleReviewReceived").optional().isIn(["Yes", "No", "N/A"]),
  body("trainingSessionOrganised").optional().isIn(["Yes", "No", "N/A"]),
  body("trainingSessionNotes").optional().isString(),
  // Rebate Management
  body("rebateAppliedFor").optional().isIn(["Yes", "No", "N/A"]),
  body("rebateAppliedEmailSent").optional().isIn(["Yes", "No", "N/A"]),
  body("rebateApprovedEmailSent").optional().isIn(["Yes", "No", "N/A"]),
  // Designs tab dropdowns
  body("designAskOldInvoice")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("designAskTerms").optional().isIn(["In Progress", "Completed", "N/A"]),
  body("designSendDesignerInfo")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("designSendProposals")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("designClientChosen")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("designUploadHeaders")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("designUploadChosen")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("designTemplatesCreated")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("designTemplatesSent")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("designTemplatesUploaded")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("designMoreNotes").optional().isString(),

  // Settings tab dropdowns
  body("settingsUploadLogo")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsCompanyInfo")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsTaxSettings")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsEmailSettings")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsTasks").optional().isIn(["In Progress", "Completed", "N/A"]),
  body("settingsRegionLanguages")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsNotification")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsJobSettings")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsInvoicing")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsJobSettings2")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsPublicHoliday")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsStaffLeave")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsSM814").optional().isIn(["In Progress", "Completed", "N/A"]),
  body("settingsStaffAccounts")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsLabourRates")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsSecurityRoles")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsCategories")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsCreateQueues")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsAdminInvoice")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsAdminReschedule")
    .optional()
    .isIn(["In Progress", "Completed", "N/A"]),
  body("settingsNotes").optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Pass to central error handler
      const error = new AppError("Validation failed", 400, errors.array());
      return next(error);
    }
    next();
  },
];

module.exports = validateJob;
