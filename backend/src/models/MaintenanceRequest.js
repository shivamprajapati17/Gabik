const mongoose = require('mongoose');
const { Schema } = mongoose;

const maintenanceRequestSchema = new Schema({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  assetId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  issueDescription: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  photos: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String
    }
  }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Technician Assigned', 'In Progress', 'Resolved', 'Closed'],
    default: 'Pending'
  },
  resolutionNotes: {
    type: String,
    trim: true
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
maintenanceRequestSchema.index({ tenantId: 1, assetId: 1, status: 1 });
maintenanceRequestSchema.index({ tenantId: 1, requestedBy: 1, status: 1 });
maintenanceRequestSchema.index({ tenantId: 1, assignedTo: 1, status: 1 });
maintenanceRequestSchema.index({ tenantId: 1, requestedAt: -1 });

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);