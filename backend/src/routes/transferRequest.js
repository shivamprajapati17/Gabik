const express = require('express');
const router = express.Router();
const {
  createTransferRequest,
  getTransferRequests,
  getTransferRequestById,
  approveTransferRequest,
  rejectTransferRequest,
  processTransferRequest
} = require('../controllers/transferRequestController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   POST api/transfer-requests
// @desc    Create a transfer request
// @access  Private
router.post('/', createTransferRequest);

// @route   GET api/transfer-requests
// @desc    Get transfer requests (with filtering)
// @access  Private
router.get('/', getTransferRequests);

// @route   GET api/transfer-requests/:id
// @desc    Get transfer request by ID
// @access  Private
router.get('/:id', getTransferRequestById);

// @route   PUT api/transfer-requests/:id/approve
// @desc    Approve transfer request
// @access  Private
router.put('/:id/approve', approveTransferRequest);

// @route   PUT api/transfer-requests/:id/reject
// @desc    Reject transfer request
// @access  Private
router.put('/:id/reject', rejectTransferRequest);

// @route   PUT api/transfer-requests/:id/process
// @desc    Process approved transfer request
// @access  Private
router.put('/:id/process', processTransferRequest);

module.exports = router;