const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const MaintenanceRequest = require('../models/MaintenanceRequest');

let counter = {};

const generateAssetTag = async (tenantId) => {
  if (!counter[tenantId]) counter[tenantId] = 0;
  counter[tenantId]++;
  const seq = String(counter[tenantId]).padStart(4, '0');
  const tag = `AF-${seq}`;
  const exists = await Asset.findOne({ tenantId, assetTag: tag });
  if (exists) return generateAssetTag(tenantId);
  return tag;
};

exports.list = async (req, res) => {
  try {
    const { search, categoryId, status, departmentId, location, page = 1, limit = 20 } = req.query;
    const filter = { tenantId: req.tenantId };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { assetTag: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (categoryId) filter.categoryId = categoryId;
    if (status) filter.status = status;
    if (departmentId) filter.departmentId = departmentId;
    if (location) filter.location = { $regex: location, $options: 'i' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [assets, total] = await Promise.all([
      Asset.find(filter).populate('categoryId', 'name').populate('departmentId', 'name').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Asset.countDocuments(filter)
    ]);
    res.json({ data: assets, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.getById = async (req, res) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, tenantId: req.tenantId })
      .populate('categoryId', 'name')
      .populate('departmentId', 'name');
    if (!asset) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Asset not found' } });
    const currentAllocation = await Allocation.findOne({ assetId: asset._id, returnedAt: null })
      .populate('holderUserId', 'name email')
      .populate('holderDepartmentId', 'name');
    const allocations = await Allocation.find({ assetId: asset._id })
      .populate('holderUserId', 'name email')
      .sort({ allocatedAt: -1 }).limit(20);
    const maintenanceHistory = await MaintenanceRequest.find({ assetId: asset._id })
      .populate('raisedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 }).limit(20);
    res.json({ data: { ...asset.toObject(), currentAllocation, allocations, maintenanceHistory } });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.create = async (req, res) => {
  try {
    const assetTag = await generateAssetTag(req.tenantId);
    const asset = new Asset({ tenantId: req.tenantId, assetTag, ...req.body });
    await asset.save();
    await asset.populate('categoryId', 'name');
    await asset.populate('departmentId', 'name');
    res.status(201).json({ data: asset });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: { code: 'DUPLICATE', message: 'Asset tag or QR code already exists' } });
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.update = async (req, res) => {
  try {
    const asset = await Asset.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name').populate('departmentId', 'name');
    if (!asset) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Asset not found' } });
    res.json({ data: asset });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};
