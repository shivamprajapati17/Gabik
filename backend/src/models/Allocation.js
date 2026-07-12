const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  holderUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  holderDepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  allocatedAt: { type: Date, default: Date.now },
  expectedReturnDate: { type: Date, default: null },
  returnedAt: { type: Date, default: null },
  returnConditionNotes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

allocationSchema.index({ tenantId: 1, assetId: 1 });
allocationSchema.index({ tenantId: 1, holderUserId: 1 });

module.exports = mongoose.model('Allocation', allocationSchema);
