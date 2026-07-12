const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  bookedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  purpose: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ tenantId: 1, resourceId: 1, status: 1 });
bookingSchema.index({ tenantId: 1, bookedBy: 1, status: 1 });
bookingSchema.index({ tenantId: 1, startTime: 1 });
bookingSchema.index({ tenantId: 1, endTime: 1 });
// Index for preventing double-booking (overlapping time ranges)
// This will be handled at the application level with proper validation

module.exports = mongoose.model('Booking', bookingSchema);