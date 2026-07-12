const mongoose = require('mongoose');
const { Schema } = mongoose;

const transferRequestSchema = new Schema({
  assetId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  fromUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['requested', 'approved', 'rejected'],
    default: 'requested'
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
transferRequestSchema.index({ organizationId: 1 });
transferRequestSchema.index({ status: 1 });
transferRequestSchema.index({ assetId: 1, status: 1 });
transferRequestSchema.index({ organizationId: 1, status: 1 });
transferRequestSchema.index({ fromUserId: 1 });
transferRequestSchema.index({ toUserId: 1 });
transferRequestSchema.index({ requestedBy: 1 });

module.exports = mongoose.model('TransferRequest', transferRequestSchema);