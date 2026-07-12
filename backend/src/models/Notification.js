const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'asset_assigned', 'transfer_requested', 'transfer_approved', 'transfer_rejected',
  'maintenance_approved', 'maintenance_rejected', 'booking_confirmed', 'booking_cancelled',
  'booking_reminder', 'overdue_return', 'audit_discrepancy'
];

const notificationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: NOTIFICATION_TYPES, required: true },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  readAt: { type: Date, default: null }
}, { timestamps: true });

notificationSchema.index({ tenantId: 1, userId: 1, readAt: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
