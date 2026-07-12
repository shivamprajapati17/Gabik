const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Helper function to check for overlapping bookings
const checkOverlappingBooking = async (resourceId, startTime, endTime, excludeBookingId = null) => {
  const query = {
    resource: resourceId,
    status: { $in: ['Upcoming', 'Ongoing'] }, // Only check active bookings
    $or: [
      { startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existingBooking = await Booking.findOne(query);
  return existingBooking !== null;
};

// @desc    Book a resource for a time slot
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resourceId, startTime, endTime, purpose } = req.body;

    // Check if resource exists
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if resource is available for booking
    if (resource.status !== 'Available') {
      return res.status(400).json({ message: 'Resource is not available for booking' });
    }

    // Validate time range
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      return res.status(400).json({ message: 'Start time must be before end time' });
    }

    // Check for overlapping bookings (double-booking prevention)
    const hasOverlap = await checkOverlappingBooking(resourceId, start, end);
    if (hasOverlap) {
      return res.status(400).json({ message: 'Resource is already booked for the selected time slot' });
    }

    // Create new booking
    const booking = new Booking({
      resource: resourceId,
      user: req.user.id, // Assuming req.user is set by auth middleware
      department: req.user.department, // Assuming user has department populated
      startTime: start,
      endTime: end,
      purpose: purpose || '',
      status: 'Upcoming'
    });

    await booking.save();

    // Populate references for response
    await booking.populate([
      { path: 'resource', select: 'name resourceTag' },
      { path: 'user', select: 'firstName lastName email' },
      { path: 'department', select: 'name' }
    ]);

    res.status(201).json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all bookings with filtering
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    const { status, resourceId, userId, startDate, endDate } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (resourceId) filter.resource = resourceId;
    if (userId) filter.user = userId;

    // Date range filtering
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    // Add tenant isolation
    filter.tenant = req.user.tenantId;

    const bookings = await Booking.find(filter)
      .populate([
        { path: 'resource', select: 'name resourceTag category' },
        { path: 'user', select: 'firstName lastName email' },
        { path: 'department', select: 'name' }
      ])
      .sort({ startTime: 1 });

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate([
        { path: 'resource', select: 'name resourceTag category status' },
        { path: 'user', select: 'firstName lastName email role' },
        { path: 'department', select: 'name' }
      ]);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check tenant isolation
    if (booking.tenant.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startTime, endTime, purpose } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check tenant isolation
    if (booking.tenant.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if booking can be modified (only Upcoming bookings can be modified)
    if (booking.status !== 'Upcoming') {
      return res.status(400).json({ message: 'Only upcoming bookings can be modified' });
    }

    // Validate time range if provided
    let start = booking.startTime;
    let end = booking.endTime;
    if (startTime) start = new Date(startTime);
    if (endTime) end = new Date(endTime);
    if (start >= end) {
      return res.status(400).json({ message: 'Start time must be before end time' });
    }

    // Check for overlapping bookings if time is changing
    if (startTime || endTime) {
      const hasOverlap = await checkOverlappingBooking(
        booking.resource,
        start,
        end,
        booking._id
      );
      if (hasOverlap) {
        return res.status(400).json({ message: 'Resource is already booked for the selected time slot' });
      }
    }

    // Update booking
    if (startTime) booking.startTime = start;
    if (endTime) booking.endTime = end;
    if (purpose !== undefined) booking.purpose = purpose;

    await booking.save();

    // Populate references for response
    await booking.populate([
      { path: 'resource', select: 'name resourceTag' },
      { path: 'user', select: 'firstName lastName email' },
      { path: 'department', select: 'name' }
    ]);

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check tenant isolation
    if (booking.tenant.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow cancelling upcoming bookings
    if (booking.status !== 'Upcoming') {
      return res.status(400).json({ message: 'Only upcoming bookings can be cancelled' });
    }

    // Update status
    booking.status = 'Cancelled';
    await booking.save();

    // Populate references for response
    await booking.populate([
      { path: 'resource', select: 'name resourceTag' },
      { path: 'user', select: 'firstName lastName email' },
      { path: 'department', select: 'name' }
    ]);

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking
};