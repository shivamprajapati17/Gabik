const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const MaintenanceRequest = require('../models/MaintenanceRequest');

exports.utilization = async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments({ tenantId: req.tenantId });
    const allocated = await Asset.countDocuments({ tenantId: req.tenantId, status: 'allocated' });
    const available = await Asset.countDocuments({ tenantId: req.tenantId, status: 'available' });
    const maintenance = await Asset.countDocuments({ tenantId: req.tenantId, status: 'under_maintenance' });
    const lost = await Asset.countDocuments({ tenantId: req.tenantId, status: 'lost' });
    const byDepartment = await Asset.aggregate([
      { $match: { tenantId: req.tenantId } },
      { $group: { _id: '$departmentId', count: { $sum: 1 } } }
    ]);
    res.json({ data: { totalAssets, allocated, available, maintenance, lost, byDepartment } });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.maintenanceFrequency = async (req, res) => {
  try {
    const freq = await MaintenanceRequest.aggregate([
      { $match: { tenantId: req.tenantId } },
      { $group: { _id: '$assetId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    await Asset.populate(freq, { path: '_id', select: 'name assetTag' });
    res.json({ data: freq });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.idleAssets = async (req, res) => {
  try {
    const allocatedAssetIds = await Allocation.distinct('assetId', { tenantId: req.tenantId, returnedAt: null });
    const idle = await Asset.find({
      tenantId: req.tenantId,
      _id: { $nin: allocatedAssetIds },
      status: { $nin: ['lost', 'retired', 'disposed'] }
    }).populate('categoryId', 'name').limit(50);
    res.json({ data: idle });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.upcomingMaintenance = async (req, res) => {
  try {
    const assets = await Asset.find({
      tenantId: req.tenantId,
      condition: { $in: ['poor', 'fair'] },
      status: { $nin: ['lost', 'retired', 'disposed', 'under_maintenance'] }
    }).populate('categoryId', 'name').limit(50);
    res.json({ data: assets });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.bookingHeatmap = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { tenantId: req.tenantId };
    if (startDate) filter.startTime = { $gte: new Date(startDate) };
    if (endDate) filter.endTime = { $lte: new Date(endDate) };
    const bookings = await Booking.aggregate([
      { $match: filter },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ data: bookings });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};
