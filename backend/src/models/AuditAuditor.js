const mongoose = require('mongoose');

const auditAuditorSchema = new mongoose.Schema({
  auditCycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'AuditCycle', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

auditAuditorSchema.index({ auditCycleId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('AuditAuditor', auditAuditorSchema);
