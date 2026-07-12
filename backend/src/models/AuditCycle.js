const mongoose = require('mongoose');

const auditCycleSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true, trim: true },
  scopeDepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  scopeLocation: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  closedAt: { type: Date, default: null }
}, { timestamps: true });

auditCycleSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('AuditCycle', auditCycleSchema);
