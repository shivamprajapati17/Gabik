const mongoose = require('mongoose');

const transferRequestSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['requested', 'approved', 'rejected'], default: 'requested' },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolvedAt: { type: Date, default: null }
}, { timestamps: true });

transferRequestSchema.index({ tenantId: 1, status: 1 });
transferRequestSchema.index({ tenantId: 1, assetId: 1 });

module.exports = mongoose.model('TransferRequest', transferRequestSchema);
