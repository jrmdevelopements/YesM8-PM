const { body, validationResult } = require("express-validator");

const validateJob = [
  body("job_uuid").notEmpty().withMessage("job_uuid is required"),
  body("sm8_account_uuid").notEmpty().withMessage("sm8_account_uuid is required"),
  // Other standard fields
  body("generated_job_id").optional().isString(),
  body("notes").optional().isString(),
  
  // Discovery fields – enums and allowed values
  body("whatAfter").optional().isString(),
  body("diffApp").optional().isIn(["Yes", "No"]),
  body("diffAppDetails").optional().isString(),
  body("specialIntegration").optional().isIn(["Yes", "No"]),
  body("hasWebsite").optional().isIn(["Yes", "No"]),
  body("websiteAddress").optional().isURL().withMessage("Must be a valid URL"),
  body("websiteFormLink").optional().isIn(["Yes", "No"]),
  body("devices").optional().isArray().withMessage("Devices must be an array"),
  body("staffAndroid").optional().isIn(["Yes", "No"]),
  body("androidLimitation").optional().isIn(["Yes", "No"]),
  body("accounting").optional().isIn(["Yes", "No"]),
  body("accountingPackage").optional().isIn(["Xero", "MYOB", "Quickbooks", "Other"]),
  body("accountingOtherWarning").optional().isIn(["Yes", "No"]),
  body("avgJobs").optional().isInt({ min: 0 }).withMessage("Must be a positive integer"),
  body("templates").optional().isIn(["Invoice", "Quote", "Both"]),
  body("checklist").optional().isIn(["Yes", "No"]),
  body("checklistExamples").optional().isIn(["Yes", "No"]),
  body("forms").optional().isIn(["Yes", "No"]),
  body("formsExamples").optional().isIn(["Yes", "No"]),
  body("specialFeatures").optional().isArray().withMessage("Special features must be an array"),
  body("plan").optional().isIn(["Starter - $29", "Growing - $79", "Premium - $149", "Premium Plus - $349"]),
  body("explainedPlans").optional().isIn(["Yes", "No"]),
  body("planNotes").optional().isString(),
  body("training").optional().isIn(["Google meet", "Ellenbrook", "Client Premises", "Other"]),
  body("otherNotes").optional().isString(),

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