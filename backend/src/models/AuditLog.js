const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditLogSchema = new Schema({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  entityType: {
    type: String,
    required: true,
    trim: true
    // Asset, Resource, Allocation, Booking, MaintenanceRequest, User, etc.
  },
  entityId: {
    type: Schema.Types.ObjectId,
    refPath: 'entityType',
    required: true
  },
  changes: {
    type: Map,
    of: Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
auditLogSchema.index({ tenantId: 1, createdAt: -1 });
auditLogSchema.index({ tenantId: 1, userId: 1 });
auditLogSchema.index({ tenantId: 1, entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);