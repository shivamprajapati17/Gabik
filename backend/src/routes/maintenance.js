const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules = [
  // create maintenance request
  body('assetId').isMongoId().withMessage('Valid asset ID is required'),
  body('issueDescription').trim().notEmpty().withMessage('Issue description is required').isLength({ max: 1000 }).withMessage('Issue description must not exceed 1000 characters'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Priority must be one of: Low, Medium, High, Critical'),
  body('photos').optional().isArray().withMessage('Photos must be an array'),
  body('photos.*.url').if(body('photos').exists()).isURL().withMessage('Each photo must have a valid URL'),

  // update maintenance request
  body('status').optional().isIn(['Pending', 'Approved', 'Rejected', 'Technician Assigned', 'In Progress', 'Resolved', 'Closed']).withMessage('Invalid status'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid user ID for assignee'),
  body('resolutionNotes').optional().trim().isLength({ max: 1000 }).withMessage('Resolution notes must not exceed 1000 characters'),

  // update maintenance progress
  body('status').optional().isIn(['In Progress', 'Resolved', 'Closed']).withMessage('Invalid progress status'),
  body('resolutionNotes').optional().trim().isLength({ max: 1000 }).withMessage('Resolution notes must not exceed 1000 characters')
];

// Apply auth middleware to all routes
router.use(protect);

// Maintenance request routes
router.route('/')
  .post(validate(createMaintenanceRequest), maintenanceController.createMaintenanceRequest)
  .get(validate(getMaintenanceRequests), maintenanceController.getMaintenanceRequests);

router.route('/:id')
  .get(validate(getMaintenanceRequestById), maintenanceController.getMaintenanceRequestById)
  .put(validate(updateMaintenanceRequest), maintenanceController.updateMaintenanceRequest);

router.route('/:id/progress')
  .put(validate(updateMaintenanceProgress), maintenanceController.updateMaintenanceProgress);

router.route('/assets/:assetId/maintenance-history')
  .get(validate(getMaintenanceHistory), maintenanceController.getMaintenanceHistory);

module.exports = router;