const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  action: { type: String, required: true },
  before: { type: mongoose.Schema.Types.Mixed, default: null },
  after: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

activityLogSchema.index({ tenantId: 1, entityType: 1, entityId: 1 });
activityLogSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
