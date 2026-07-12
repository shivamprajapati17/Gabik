const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Allocate an asset to a user
// @route   POST /api/allocations
// @access  Private (Asset Manager or Admin)
const allocateAsset = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assetId, userId, departmentId, notes } = req.body;

    // Check if asset exists and is available
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (asset.status !== 'Available') {
      return res.status(400).json({ message: 'Asset is not available for allocation' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for double allocation (active allocation for this asset)
    const existingAllocation = await Allocation.findOne({
      asset: assetId,
      status: 'Active'
    });

    if (existingAllocation) {
      return res.status(400).json({
        message: 'Asset is already allocated to another user',
        existingAllocation: existingAllocation._id
      });
    }

    // Create new allocation
    const allocation = new Allocation({
      asset: assetId,
      user: userId,
      department: departmentId || null,
      notes: notes || '',
      allocatedAt: new Date()
    });

    await allocation.save();

    // Update asset status to Allocated
    asset.status = 'Allocated';
    asset.allocatedTo = userId;
    asset.allocatedAt = new Date();
    await asset.save();

    // Populate references for response
    await allocation.populate([
      { path: 'asset', select: 'name assetTag' },
      { path: 'user', select: 'firstName lastName email' },
      { path: 'department', select: 'name' }
    ]);

    res.status(201).json(allocation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Return an allocated asset
// @route   PUT /api/allocations/:id/return
// @access  Private (Asset Manager, Admin, or the user who has the asset)
const returnAsset = async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id);

    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    // Check if already returned
    if (allocation.status === 'Returned') {
      return res.status(400).json({ message: 'Asset already returned' });
    }

    // Update allocation status
    allocation.status = 'Returned';
    allocation.returnedAt = new Date();
    await allocation.save();

    // Update asset status back to Available
    const asset = await Asset.findById(allocation.asset);
    if (asset) {
      asset.status = 'Available';
      asset.allocatedTo = null;
      asset.allocatedAt = null;
      await asset.save();
    }

    // Populate references for response
    await allocation.populate([
      { path: 'asset', select: 'name assetTag' },
      { path: 'user', select: 'firstName lastName email' },
      { path: 'department', select: 'name' }
    ]);

    res.json(allocation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Transfer asset from one user to another
// @route   PUT /api/allocations/:id/transfer
// @access  Private (Asset Manager or Admin)
const transferAsset = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { newUserId, notes } = req.body;
    const allocation = await Allocation.findById(req.params.id);

    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    // Check if allocation is active
    if (allocation.status !== 'Active') {
      return res.status(400).json({ message: 'Can only transfer active allocations' });
    }

    // Check if new user exists
    const newUser = await User.findById(newUserId);
    if (!newUser) {
      return res.status(404).json({ message: 'New user not found' });
    }

    // Check if asset is still allocated (should be, but double-check)
    const asset = await Asset.findById(allocation.asset);
    if (!asset || asset.status !== 'Allocated') {
      return res.status(400).json({ message: 'Asset is not currently allocated' });
    }

    // Update allocation
    allocation.user = newUserId;
    if (notes) allocation.notes = notes;
    allocation.transferredAt = new Date();
    await allocation.save();

    // Update asset allocatedTo reference
    asset.allocatedTo = newUserId;
    await asset.save();

    // Populate references for response
    await allocation.populate([
      { path: 'asset', select: 'name assetTag' },
      { path: 'user', select: 'firstName lastName email' },
      { path: 'department', select: 'name' }
    ]);

    res.json(allocation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all allocations (with filtering)
// @route   GET /api/allocations
// @access  Private (Asset Manager, Admin, or Department Head)
const getAllocations = async (req, res) => {
  try {
    const { status, userId, assetId, departmentId } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.user = userId;
    if (assetId) filter.asset = assetId;
    if (departmentId) filter.department = departmentId;

    // Add tenant isolation
    filter.tenant = req.user.tenantId;

    const allocations = await Allocation.find(filter)
      .populate([
        { path: 'asset', select: 'name assetTag category' },
        { path: 'user', select: 'firstName lastName email' },
        { path: 'department', select: 'name' }
      ])
      .sort({ allocatedAt: -1 });

    res.json(allocations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get allocation by ID
// @route   GET /api/allocations/:id
// @access  Private
const getAllocationById = async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id)
      .populate([
        { path: 'asset', select: 'name assetTag category status' },
        { path: 'user', select: 'firstName lastName email role' },
        { path: 'department', select: 'name' }
      ]);

    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    // Check tenant isolation
    if (allocation.tenant.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(allocation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  allocateAsset,
  returnAsset,
  transferAsset,
  getAllocations,
  getAllocationById
};