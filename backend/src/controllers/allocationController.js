const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');

exports.allocate = async (req, res) => {
  try {
    const { assetId, holderUserId, holderDepartmentId, expectedReturnDate } = req.body;
    const asset = await Asset.findOne({ _id: assetId, tenantId: req.tenantId });
    if (!asset) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Asset not found' } });
    if (asset.status === 'lost' || asset.status === 'retired' || asset.status === 'disposed') {
      return res.status(400).json({ error: { code: 'INVALID_STATE', message: `Asset is ${asset.status} and cannot be allocated` } });
    }
    const activeAllocation = await Allocation.findOne({ assetId, returnedAt: null }).populate('holderUserId', 'name email');
    if (activeAllocation) {
      return res.status(409).json({
        error: { code: 'DOUBLE_ALLOCATION', message: 'Asset is already allocated' },
        conflict: { currentHolder: activeAllocation.holderUserId, allocatedAt: activeAllocation.allocatedAt }
      });
    }
    const allocation = new Allocation({
      tenantId: req.tenantId, assetId, holderUserId, holderDepartmentId,
      expectedReturnDate, createdBy: req.user._id
    });
    await allocation.save();
    asset.status = 'allocated';
    await asset.save();
    await allocation.populate('holderUserId', 'name email');
    await allocation.populate('assetId', 'name assetTag');
    res.status(201).json({ data: allocation });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.returnAsset = async (req, res) => {
  try {
    const { returnConditionNotes } = req.body;
    const allocation = await Allocation.findOne({ _id: req.params.id, tenantId: req.tenantId, returnedAt: null });
    if (!allocation) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Active allocation not found' } });
    allocation.returnedAt = new Date();
    allocation.returnConditionNotes = returnConditionNotes || '';
    await allocation.save();
    const asset = await Asset.findById(allocation.assetId);
    if (asset) {
      let newStatus = 'available';
      if (asset.status === 'under_maintenance') newStatus = 'under_maintenance';
      asset.status = newStatus;
      await asset.save();
    }
    res.json({ data: allocation });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.getActiveAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findOne({ assetId: req.params.assetId, returnedAt: null })
      .populate('holderUserId', 'name email')
      .populate('holderDepartmentId', 'name');
    res.json({ data: allocation });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.list = async (req, res) => {
  try {
    const { status, assetId, holderUserId } = req.query;
    const filter = { tenantId: req.tenantId };
    if (status === 'active') filter.returnedAt = null;
    if (status === 'returned') filter.returnedAt = { $ne: null };
    if (assetId) filter.assetId = assetId;
    if (holderUserId) filter.holderUserId = holderUserId;
    const allocations = await Allocation.find(filter)
      .populate('assetId', 'name assetTag')
      .populate('holderUserId', 'name email')
      .populate('holderDepartmentId', 'name')
      .sort({ allocatedAt: -1 });
    res.json({ data: allocations });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};
