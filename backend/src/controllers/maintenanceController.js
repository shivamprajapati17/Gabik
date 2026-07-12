const MaintenanceRequest = require('../models/MaintenanceRequest');
const Asset = require('../models/Asset');
const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * Create a new maintenance request
 * POST /api/maintenance-requests
 * Access: Employee, Dept Head, Asset Manager, Admin
 */
exports.createMaintenanceRequest = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const {
    assetId,
    issueDescription,
    priority,
    photos = []
  } = req.body;

  // Verify asset exists
  const asset = await Asset.findById(assetId);
  if (!asset) {
    return next(new AppError('Asset not found', 404));
  }

  // Check tenant isolation - user can only create requests for assets in their tenant
  if (asset.tenantId.toString() !== req.user.tenantId.toString()) {
    return next(new AppError('Access denied: Asset belongs to different tenant', 403));
  }

  const maintenanceRequest = await MaintenanceRequest.create({
    tenantId: req.user.tenantId,
    assetId,
    requestedBy: req.user.id,
    issueDescription,
    priority: priority || 'Medium',
    photos
  });

  res.status(201).json({
    status: 'success',
    data: {
      maintenanceRequest
    }
  });
});

/**
 * Get maintenance requests with filtering
 * GET /api/maintenance-requests
 * Access: Based on role filters
 */
exports.getMaintenanceRequests = catchAsync(async (req, res, next) => {
  const { status, priority, assetId, assignedTo, page = 1, limit = 10 } = req.query;

  // Build filter object
  const filter = { tenantId: req.user.tenantId };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assetId) filter.assetId = assetId;
  if (assignedTo) filter.assignedTo = assignedTo;

  // Role-based filtering
  const userRole = req.user.role;
  if (userRole === 'Employee') {
    filter.requestedBy = req.user.id;
  } else if (userRole === 'Department Head') {
    // Department heads can see requests from their department
    // This would require joining with user/department data
    // For now, we'll allow them to see all in tenant (can be refined)
  }
  // Asset Managers and Admins see all (no additional filter needed)

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [maintenanceRequests, total] = await Promise.all([
    MaintenanceRequest.find(filter)
      .populate('assetId', 'name assetTag')
      .populate('requestedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    MaintenanceRequest.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    results: maintenanceRequests.length,
    data: {
      maintenanceRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

/**
 * Get maintenance request by ID
 * GET /api/maintenance-requests/:id
 * Access: Based on permissions
 */
exports.getMaintenanceRequestById = catchAsync(async (req, res, next) => {
  const maintenanceRequest = await MaintenanceRequest.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  })
  .populate('assetId', 'name assetTag status')
  .populate('requestedBy', 'firstName lastName email')
  .populate('approvedBy', 'firstName lastName')
  .populate('assignedTo', 'firstName lastName');

  if (!maintenanceRequest) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Check permissions
  const userRole = req.user.role;
  const isRequester = maintenanceRequest.requestedBy._id.toString() === req.user.id;
  const isAssigned = maintenanceRequest.assignedTo &&
                    maintenanceRequest.assignedTo._id.toString() === req.user.id;

  // Employees can only see their own requests unless assigned or approved by them
  if (userRole === 'Employee' && !isRequester && !isAssigned) {
    return next(new AppError('Access denied: You can only view your own maintenance requests', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      maintenanceRequest
    }
  });
});

/**
 * Update maintenance request (approval/rejection/assignment)
 * PUT /api/maintenance-requests/:id
 * Access: Asset Manager, Admin
 */
exports.updateMaintenanceRequest = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { status, assignedTo, resolutionNotes } = req.body;

  const maintenanceRequest = await MaintenanceRequest.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });

  if (!maintenanceRequest) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Only Asset Manager and Admin can update status/assignment
  const allowedRoles = ['Asset Manager', 'Admin'];
  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError('Access denied: Only Asset Managers and Admins can update maintenance requests', 403));
  }

  // Handle status transitions
  let assetStatusUpdated = false;

  if (status === 'Approved' && maintenanceRequest.status !== 'Approved') {
    // Approve the request - set asset to Under Maintenance
    const asset = await Asset.findById(maintenanceRequest.assetId);
    if (asset) {
      await asset.setUnderMaintenance();
      maintenanceRequest.approvedBy = req.user.id;
      maintenanceRequest.approvedAt = new Date();
      assetStatusUpdated = true;
    }
  } else if ((status === 'Resolved' || status === 'Closed') &&
             maintenanceRequest.status !== 'Resolved' &&
             maintenanceRequest.status !== 'Closed') {
    // Resolve/close the request - set asset back to Available
    const asset = await Asset.findById(maintenanceRequest.assetId);
    if (asset) {
      await asset.setAvailable();
      maintenanceRequest.completedAt = new Date();
      assetStatusUpdated = true;
    }
  }

  // Update the maintenance request
  if (status !== undefined) maintenanceRequest.status = status;
  if (assignedTo !== undefined) maintenanceRequest.assignedTo = assignedTo;
  if (resolutionNotes !== undefined) maintenanceRequest.resolutionNotes = resolutionNotes;

  await maintenanceRequest.save();

  // Repopulate for response
  const updatedRequest = await MaintenanceRequest.findById(maintenanceRequest._id)
    .populate('assetId', 'name assetTag')
    .populate('requestedBy', 'firstName lastName')
    .populate('approvedBy', 'firstName lastName')
    .populate('assignedTo', 'firstName lastName');

  res.status(200).json({
    status: 'success',
    data: {
      maintenanceRequest: updatedRequest
    }
  });
});

/**
 * Update maintenance progress (for technicians)
 * PUT /api/maintenance-requests/:id/progress
 * Access: Assigned Technician, Asset Manager, Admin
 */
exports.updateMaintenanceProgress = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { status, resolutionNotes } = req.body;

  const maintenanceRequest = await MaintenanceRequest.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });

  if (!maintenanceRequest) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Check permissions - assigned technician, asset manager, or admin
  const isAssigned = maintenanceRequest.assignedTo &&
                    maintenanceRequest.assignedTo.toString() === req.user.id;
  const allowedRoles = ['Asset Manager', 'Admin'];
  const isManagerOrAdmin = allowedRoles.includes(req.user.role);

  if (!isAssigned && !isManagerOrAdmin) {
    return next(new AppError('Access denied: Only assigned technicians, asset managers, or admins can update progress', 403));
  }

  // Update fields
  if (status) maintenanceRequest.status = status;
  if (resolutionNotes !== undefined) maintenanceRequest.resolutionNotes = resolutionNotes;

  // If marked as resolved/in progress and not already completed, set completedAt
  if ((status === 'In Progress' || status === 'Resolved') && !maintenanceRequest.completedAt) {
    maintenanceRequest.updatedAt = new Date();
  }

  if (status === 'Resolved' || status === 'Closed') {
    maintenanceRequest.completedAt = new Date();

    // Update asset status to Available
    const asset = await Asset.findById(maintenanceRequest.assetId);
    if (asset) {
      await asset.setAvailable();
    }
  }

  await maintenanceRequest.save();

  // Repopulate for response
  const updatedRequest = await MaintenanceRequest.findById(maintenanceRequest._id)
    .populate('assetId', 'name assetTag')
    .populate('requestedBy', 'firstName lastName')
    .populate('approvedBy', 'firstName lastName')
    .populate('assignedTo', 'firstName lastName');

  res.status(200).json({
    status: 'success',
    data: {
      maintenanceRequest: updatedRequest
    }
  });
});

/**
 * Get maintenance history for an asset
 * GET /api/assets/:assetId/maintenance-history
 * Access: Based on asset tenant and user role
 */
exports.getMaintenanceHistory = catchAsync(async (req, res, next) => {
  const { assetId } = req.params;

  // Verify asset exists and belongs to user's tenant
  const asset = await Asset.findOne({
    _id: assetId,
    tenantId: req.user.tenantId
  });

  if (!asset) {
    return next(new AppError('Asset not found or access denied', 404));
  }

  const maintenanceHistory = await MaintenanceRequest.find({ assetId })
    .populate('requestedBy', 'firstName lastName')
    .populate('approvedBy', 'firstName lastName')
    .populate('assignedTo', 'firstName lastName')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: maintenanceHistory.length,
    data: {
      maintenanceHistory
    }
  });
});