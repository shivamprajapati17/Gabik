const Booking = require('../models/Booking');
const Resource = require('../models/Resource');

exports.create = async (req, res) => {
  try {
    const { resourceId, startTime, endTime } = req.body;
    const resource = await Resource.findOne({ _id: resourceId, tenantId: req.tenantId });
    if (!resource) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found' } });
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) return res.status(400).json({ error: { code: 'VALIDATION', message: 'Start time must be before end time' } });
    const overlap = await Booking.findOne({
      tenantId: req.tenantId, resourceId,
      status: { $in: ['upcoming', 'ongoing'] },
      startTime: { $lt: end },
      endTime: { $gt: start }
    });
    if (overlap) {
      return res.status(409).json({
        error: { code: 'OVERLAP', message: 'Time slot overlaps with an existing booking' },
        conflict: { bookingId: overlap._id, startTime: overlap.startTime, endTime: overlap.endTime }
      });
    }
    const booking = new Booking({
      tenantId: req.tenantId, resourceId, bookedBy: req.user._id,
      startTime: start, endTime: end
    });
    await booking.save();
    await booking.populate('resourceId', 'name');
    res.status(201).json({ data: booking });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.list = async (req, res) => {
  try {
    const { resourceId, status, startDate, endDate } = req.query;
    const filter = { tenantId: req.tenantId };
    if (resourceId) filter.resourceId = resourceId;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.$or = [
        { startTime: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { endTime: { $gte: new Date(startDate), $lte: new Date(endDate) } }
      ];
    }
    const bookings = await Booking.find(filter)
      .populate('resourceId', 'name')
      .populate('bookedBy', 'name email')
      .sort({ startTime: 1 });
    res.json({ data: bookings });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.cancel = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!booking) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Booking not found' } });
    if (booking.status !== 'upcoming') return res.status(400).json({ error: { code: 'INVALID_STATE', message: 'Only upcoming bookings can be cancelled' } });
    booking.status = 'cancelled';
    await booking.save();
    res.json({ data: booking });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};
