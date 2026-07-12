const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const TransferRequest = require('../models/TransferRequest');
const ActivityLog = require('../models/ActivityLog');

exports.getKpis = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const [available, allocated, activeBookings, pendingTransfers, overdueReturns, recentActivity] = await Promise.all([
      Asset.countDocuments({ tenantId, status: 'available' }),
      Asset.countDocuments({ tenantId, status: 'allocated' }),
      Booking.countDocuments({ tenantId, status: { $in: ['upcoming', 'ongoing'] } }),
      TransferRequest.countDocuments({ tenantId, status: 'requested' }),
      Allocation.countDocuments({ tenantId, expectedReturnDate: { $lt: new Date() }, returnedAt: null }),
      ActivityLog.find({ tenantId }).populate('actorUserId', 'name email').sort({ createdAt: -1 }).limit(10)
    ]);
    const overdueAllocations = await Allocation.find({ tenantId, expectedReturnDate: { $lt: new Date() }, returnedAt: null })
      .populate('assetId', 'name assetTag')
      .populate('holderUserId', 'name email')
      .sort({ expectedReturnDate: 1 })
      .limit(20);
    res.json({
      data: { kpis: { available, allocated, activeBookings, pendingTransfers, overdueReturns }, overdueAllocations, recentActivity }
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};
