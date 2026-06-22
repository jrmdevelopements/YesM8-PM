const { body, validationResult } = require("express-validator");

const validateJob = [
  body("job_uuid").notEmpty().withMessage("job_uuid is required"),
  body("sm8_account_uuid").notEmpty().withMessage("sm8_account_uuid is required"),
  body("job_number").optional().isString(),
  body("diff_app").optional().isIn(["Yes", "No"]),
  body("has_website").optional().isIn(["Yes", "No"]),
  // add more as needed...

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = validateJob;