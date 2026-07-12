const mongoose = require('mongoose');

const MAINTENANCE_STATUSES = ['pending', 'approved', 'rejected', 'technician_assigned', 'in_progress', 'resolved'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const maintenanceRequestSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueDescription: { type: String, required: true },
  priority: { type: String, enum: PRIORITIES, default: 'medium' },
  photoUrl: { type: String, default: null },
  status: { type: String, enum: MAINTENANCE_STATUSES, default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  technicianName: { type: String, default: '' },
  resolutionNotes: { type: String, default: '' },
  approvedAt: { type: Date, default: null },
  resolvedAt: { type: Date, default: null }
}, { timestamps: true });

maintenanceRequestSchema.index({ tenantId: 1, assetId: 1 });
maintenanceRequestSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
module.exports.MAINTENANCE_STATUSES = MAINTENANCE_STATUSES;
module.exports.PRIORITIES = PRIORITIES;
