const mongoose = require('mongoose');

const VERIFICATION_STATUSES = ['pending', 'verified', 'missing', 'damaged'];

const auditVerificationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  auditCycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'AuditCycle', required: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  expectedLocation: { type: String, default: '' },
  verification: { type: String, enum: VERIFICATION_STATUSES, default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  verifiedAt: { type: Date, default: null },
  notes: { type: String, default: '' }
}, { timestamps: true });

auditVerificationSchema.index({ tenantId: 1, auditCycleId: 1 });

module.exports = mongoose.model('AuditVerification', auditVerificationSchema);
module.exports.VERIFICATION_STATUSES = VERIFICATION_STATUSES;
