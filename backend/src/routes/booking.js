const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { auth } = require('../middleware/auth');
const { body } = require('express-validator');

// Middleware to authenticate token
router.use(auth.authenticateToken);

// @route   POST /api/bookings
// @desc    Book a resource for a time slot
// @access  Private
router.post(
  '/',
  [
    body('resourceId', 'Resource ID is required').not().isEmpty(),
    body('startTime', 'Start time is required').isISO8601(),
    body('endTime', 'End time is required').isISO8601(),
    body('purpose', 'Purpose is optional').optional().isString()
  ],
  bookingController.createBooking
);

// @route   GET /api/bookings
// @desc    Get all bookings with filtering
// @access  Private
router.get('/', bookingController.getBookings);

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', bookingController.getBookingById);

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put(
  '/:id',
  [
    body('startTime', 'Start time is required').optional().isISO8601(),
    body('endTime', 'End time is required').optional().isISO8601(),
    body('purpose', 'Purpose is optional').optional().isString()
  ],
  bookingController.updateBooking
);

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', bookingController.cancelBooking);

module.exports = router;