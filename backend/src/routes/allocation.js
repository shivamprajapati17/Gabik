const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/allocationController');
const { auth } = require('../middleware/auth');
const { body } = require('express-validator');

// Middleware to authenticate token
router.use(auth.authenticateToken);

// @route   POST /api/allocations
// @desc    Allocate an asset to a user
// @access  Private (Asset Manager or Admin)
router.post(
  '/',
  [
    body('assetId', 'Asset ID is required').not().isEmpty(),
    body('userId', 'User ID is required').not().isEmpty(),
    body('departmentId', 'Department ID is optional').optional().isMongoId(),
    body('notes', 'Notes are optional').optional().isString()
  ],
  auth.authorizeRole('Asset Manager', 'Admin'),
  allocationController.allocateAsset
);

// @route   PUT /api/allocations/:id/return
// @desc    Return an allocated asset
// @access  Private (Asset Manager, Admin, or the user who has the asset)
router.put('/:id/return', allocationController.returnAsset);

// @route   PUT /api/allocations/:id/transfer
// @desc    Transfer asset from one user to another
// @access  Private (Asset Manager or Admin)
router.put(
  '/:id/transfer',
  [
    body('newUserId', 'New User ID is required').not().isEmpty(),
    body('notes', 'Notes are optional').optional().isString()
  ],
  auth.authorizeRole('Asset Manager', 'Admin'),
  allocationController.transferAsset
);

// @route   GET /api/allocations
// @desc    Get all allocations with filtering
// @access  Private (Asset Manager, Admin, or Department Head)
router.get('/', auth.authorizeRole('Asset Manager', 'Admin', 'Department Head'), allocationController.getAllocations);

// @route   GET /api/allocations/:id
// @desc    Get allocation by ID
// @access  Private
router.get('/:id', allocationController.getAllocationById);

module.exports = router;