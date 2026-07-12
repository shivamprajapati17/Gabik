const mongoose = require('mongoose');

const BOOKING_STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'];

const bookingSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: BOOKING_STATUSES, default: 'upcoming' }
}, { timestamps: true });

bookingSchema.index({ tenantId: 1, resourceId: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ tenantId: 1, bookedBy: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
module.exports.BOOKING_STATUSES = BOOKING_STATUSES;
