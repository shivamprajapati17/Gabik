const mongoose = require('mongoose');
const { Schema } = mongoose;

const allocationSchema = new Schema({
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
  allocatedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  allocatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  allocatedDate: {
    type: Date,
    default: Date.now
  },
  expectedReturnDate: {
    type: Date
  },
  actualReturnDate: {
    type: Date
  },
  returnConditionNotes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Returned', 'Transferred'],
    default: 'Active'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
allocationSchema.index({ tenantId: 1, assetId: 1, status: 1 });
allocationSchema.index({ tenantId: 1, allocatedTo: 1, status: 1 });
allocationSchema.index({ tenantId: 1, allocatedDate: -1 });
allocationSchema.index({ tenantId: 1, expectedReturnDate: 1 });

// Index to prevent double allocation (only one active allocation per asset)
allocationSchema.index({ tenantId: 1, assetId: 1, status: 1 }, {
  unique: true,
  partialFilterExpression: { status: 'Active' }
});

module.exports = mongoose.model('Allocation', allocationSchema);