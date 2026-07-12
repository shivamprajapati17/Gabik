const { body, validationResult } = require('express-validator');

const validateTransferRequest = [
  body('assetId')
    .notEmpty()
    .withMessage('Asset ID is required')
    .isMongoId()
    .withMessage('Invalid Asset ID'),
  body('toUserId')
    .notEmpty()
    .withMessage('Target User ID is required')
    .isMongoId()
    .withMessage('Invalid User ID'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters')
];

module.exports = {
  validateTransferRequest
};