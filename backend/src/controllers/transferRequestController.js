const TransferRequest = require('../models/TransferRequest');
const Asset = require('../models/Asset');
const User = require('../models/User');
const Allocation = require('../models/Allocation');
const { validationResult } = require('express-validator');
const { validateTransferRequest } = require('../middleware/transferRequestValidation');

// @desc    Create a transfer request
// @route   POST /api/transfer-requests
// @access  Private (Employee, Asset Manager, Dept Head, Admin)
const createTransferRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assetId, toUserId, reason } = req.body;
    const userId = req.user.id; // Assuming req.user is set by auth middleware

    // Validate asset exists
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Validate target user exists
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    // Check if asset is currently allocated
    const currentAllocation = await Allocation.findOne({
      assetId: assetId,
      status: 'Active'
    });

    if (!currentAllocation) {
      return res.status(400).json({ message: 'Asset is not currently allocated' });
    }

    // Check if user has permission to request transfer
    // Employee can request transfer for assets they hold
    // Asset Manager/Dept Head/Admin can request for any asset in their scope
    if (req.user.role === 'employee' && currentAllocation.allocatedTo.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only request transfer for assets you currently hold' });
    }

    // Check if there's already a pending transfer request for this asset
    const existingRequest = await TransferRequest.findOne({
      assetId: assetId,
      status: 'requested'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'There is already a pending transfer request for this asset' });
    }

    // Create transfer request
    const transferRequest = new TransferRequest({
      assetId,
      fromUserId: currentAllocation.allocatedTo,
      toUserId,
      reason,
      requestedBy: userId,
      organizationId: asset.organizationId || req.user.tenantId.user.organizationId // Assuming orgId is in req.user or asset
    });

    await transferRequest.save();

    // Populate references for response
    await transferRequest.populate([
      { path: 'assetId', select: 'name assetTag' },
      { path: 'fromUserId', select: 'firstName lastName email' },
      { path: 'toUserId', select: 'firstName lastName email' },
      { path: 'requestedBy', select: 'firstName lastName email' }
    ]);

    res.status(201).json(transferRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get transfer requests (with filtering)
// @route   GET /api/transfer-requests
// @access  Private (Asset Manager, Dept Head, Admin)
const getTransferRequests = async (req, res) => {
  try {
    const { status, assetId, fromUserId, toUserId } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build filter object
    const filter = {};

    // Users can only see requests related to them or in their scope (simplified)
    if (userRole === 'employee') {
      filter.$or = [
        { fromUserId: userId },
        { toUserId: userId },
        { requestedBy: userId }
      ];
    } else {
      // Managers and admins can see requests in their organization
      filter.organizationId = req.user.organizationId; // Assuming orgId in user
    }

    // Apply additional filters
    if (status) filter.status = status;
    if (assetId) filter.assetId = assetId;
    if (fromUserId) filter.fromUserId = fromUserId;
    if (toUserId) filter.toUserId = toUserId;

    const transferRequests = await TransferRequest.find(filter)
      .populate([
        { path: 'assetId', select: 'name assetTag' },
        { path: 'fromUserId', select: 'firstName lastName email' },
        { path: 'toUserId', select: 'firstName lastName email' },
        { path: 'requestedBy', select: 'firstName lastName email' },
        { path: 'approvedBy', select: 'firstName lastName email' }
      ])
      .sort('-createdAt');

    res.json(transferRequests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get transfer request by ID
// @route   GET /api/transfer-requests/:id
// @access  Private
const getTransferRequestById = async (req, res) => {
  try {
    const transferRequest = await TransferRequest.findById(req.params.id)
      .populate([
        { path: 'assetId', select: 'name assetTag' },
        { path: 'fromUserId', select: 'firstName lastName email' },
        { path: 'toUserId', select: 'firstName lastName email' },
        { path: 'requestedBy', select: 'firstName lastName email' },
        { path: 'approvedBy', select: 'firstName lastName email' }
      ]);

    if (!transferRequest) {
      return res.status(404).json({ message: 'Transfer request not found' });
    }

    // Check permissions (simplified)
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'employee' &&
        transferRequest.fromUserId._id.toString() !== userId.toString() &&
        transferRequest.toUserId._id.toString() !== userId.toString() &&
        transferRequest.requestedBy._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this transfer request' });
    }

    res.json(transferRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Approve transfer request
// @route   PUT /api/transfer-requests/:id/approve
// @access  Private (Asset Manager or Dept Head for their dept, Admin)
const approveTransferRequest = async (req, res) => {
  try {
    const transferRequest = await TransferRequest.findById(req.params.id);

    if (!transferRequest) {
      return res.status(404).json({ message: 'Transfer request not found' });
    }

    // Check if already processed
    if (transferRequest.status !== 'requested') {
      return res.status(400).json({ message: `Transfer request is already ${transferRequest.status}` });
    }

    // Check permissions
    const userId = req.user.id;
    const userRole = req.user.role;

    // Simplified permission check - in reality would check dept scope for dept heads
    if (userRole !== 'admin' && userRole !== 'asset_manager') {
      // For dept head, would need to check if both users are in their department
      return res.status(403).json({ message: 'Not authorized to approve transfer requests' });
    }

    // Update transfer request
    transferRequest.status = 'approved';
    transferRequest.approvedBy = userId;
    await transferRequest.save();

    // Populate references for response
    await transferRequest.populate([
      { path: 'assetId', select: 'name assetTag' },
      { path: 'fromUserId', select: 'firstName lastName email' },
      { path: 'toUserId', select: 'firstName lastName email' },
      { path: 'requestedBy', select: 'firstName lastName email' },
      { path: 'approvedBy', select: 'firstName lastName email' }
    ]);

    res.json(transferRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Reject transfer request
// @route   PUT /api/transfer-requests/:id/reject
// @access  Private (Asset Manager or Dept Head for their dept, Admin)
const rejectTransferRequest = async (req, res) => {
  try {
    const transferRequest = await TransferRequest.findById(req.params.id);

    if (!transferRequest) {
      return res.status(404).json({ message: 'Transfer request not found' });
    }

    // Check if already processed
    if (transferRequest.status !== 'requested') {
      return res.status(400).json({ message: `Transfer request is already ${transferRequest.status}` });
    }

    // Check permissions (same as approve)
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'admin' && userRole !== 'asset_manager') {
      return res.status(403).json({ message: 'Not authorized to reject transfer requests' });
    }

    // Update transfer request
    transferRequest.status = 'rejected';
    transferRequest.approvedBy = userId; // Still track who made the decision
    await transferRequest.save();

    // Populate references for response
    await transferRequest.populate([
      { path: 'assetId', select: 'name assetTag' },
      { path: 'fromUserId', select: 'firstName lastName email' },
      { path: 'toUserId', select: 'firstName lastName email' },
      { path: 'requestedBy', select: 'firstName lastName email' },
      { path: 'approvedBy', select: 'firstName lastName email' }
    ]);

    res.json(transferRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Process approved transfer (update allocation)
// @route   PUT /api/transfer-requests/:id/process
// @access  Private (Asset Manager or Admin)
const processTransferRequest = async (req, res) => {
  try {
    const transferRequest = await TransferRequest.findById(req.params.id);

    if (!transferRequest) {
      return res.status(404).json({ message: 'Transfer request not found' });
    }

    // Check if approved
    if (transferRequest.status !== 'approved') {
      return res.status(400).json({ message: 'Transfer request must be approved before processing' });
    }

    // Check if already processed
    if (transferRequest.processedAt) {
      return res.status(400).json({ message: 'Transfer request has already been processed' });
    }

    // Check permissions
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'admin' && userRole !== 'asset_manager') {
      return res.status(403).json({ message: 'Not authorized to process transfer requests' });
    }

    // Start transaction-like operation (since we don't have transactions in this setup)
    // 1. Get current active allocation
    const currentAllocation = await Allocation.findOne({
      assetId: transferRequest.assetId,
      status: 'Active'
    });

    if (!currentAllocation) {
      return res.status(400).json({ message: 'No active allocation found for this asset' });
    }

    // 2. Update the allocation to transfer to new user
    const allocation = await Allocation.findByIdAndUpdate(
      currentAllocation._id,
      {
        user: transferRequest.toUserId,
        transferredAt: new Date(),
        notes: (allocation.notes ? allocation.notes + '\n' : '') +
               `Transferred via transfer request ${transferRequest._id} at ${new Date().toISOString()}`
      },
      { new: true }
    );

    // 3. Update asset's allocatedTo reference
    const asset = await Asset.findById(transferRequest.assetId);
    if (asset) {
      asset.allocatedTo = transferRequest.toUserId;
      await asset.save();
    }

    // 4. Mark transfer request as processed
    transferRequest.status = 'processed'; // Could add a processed status or reuse approved
    transferRequest.processedAt = new Date();
    await transferRequest.save();

    // Populate references for response
    await allocation.populate([
      { path: 'assetId', select: 'name assetTag' },
      { path: 'allocatedTo', select: 'firstName lastName email' },
      { path: 'allocatedBy', select: 'firstName lastName email' },
      { path: 'department', select: 'name' }
    ]);

    await transferRequest.populate([
      { path: 'assetId', select: 'name assetTag' },
      { path: 'fromUserId', select: 'firstName lastName email' },
      { path: 'toUserId', select: 'firstName lastName email' },
      { path: 'requestedBy', select: 'firstName lastName email' },
      { path: 'approvedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      allocation,
      transferRequest
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  createTransferRequest,
  getTransferRequests,
  getTransferRequestById,
  approveTransferRequest,
  rejectTransferRequest,
  processTransferRequest
};