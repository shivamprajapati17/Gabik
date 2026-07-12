const TransferRequest = require('../models/TransferRequest');
const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');

exports.create = async (req, res) => {
  try {
    const { assetId, fromUserId, toUserId, reason } = req.body;
    const existing = await TransferRequest.findOne({ assetId, status: 'requested' });
    if (existing) return res.status(400).json({ error: { code: 'DUPLICATE', message: 'Pending transfer already exists for this asset' } });
    const tr = new TransferRequest({
      tenantId: req.tenantId, assetId, fromUserId, toUserId, reason,
      requestedBy: req.user._id
    });
    await tr.save();
    await tr.populate('assetId', 'name assetTag');
    await tr.populate('fromUserId', 'name email');
    await tr.populate('toUserId', 'name email');
    res.status(201).json({ data: tr });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = { tenantId: req.tenantId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.assetId) filter.assetId = req.query.assetId;
    const requests = await TransferRequest.find(filter)
      .populate('assetId', 'name assetTag')
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ data: requests });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.getById = async (req, res) => {
  try {
    const tr = await TransferRequest.findOne({ _id: req.params.id, tenantId: req.tenantId })
      .populate('assetId', 'name assetTag')
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email');
    if (!tr) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Transfer request not found' } });
    res.json({ data: tr });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.approve = async (req, res) => {
  try {
    const tr = await TransferRequest.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!tr) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Transfer request not found' } });
    if (tr.status !== 'requested') return res.status(400).json({ error: { code: 'INVALID_STATE', message: `Already ${tr.status}` } });
    const activeAlloc = await Allocation.findOne({ assetId: tr.assetId, returnedAt: null });
    if (!activeAlloc) return res.status(400).json({ error: { code: 'NO_ALLOCATION', message: 'Asset is not currently allocated' } });
    activeAlloc.holderUserId = tr.toUserId;
    activeAlloc.returnedAt = null;
    await activeAlloc.save();
    tr.status = 'approved';
    tr.approvedBy = req.user._id;
    tr.resolvedAt = new Date();
    await tr.save();
    res.json({ data: tr });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.reject = async (req, res) => {
  try {
    const tr = await TransferRequest.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!tr) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Transfer request not found' } });
    if (tr.status !== 'requested') return res.status(400).json({ error: { code: 'INVALID_STATE', message: `Already ${tr.status}` } });
    tr.status = 'rejected';
    tr.approvedBy = req.user._id;
    tr.resolvedAt = new Date();
    await tr.save();
    res.json({ data: tr });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};
