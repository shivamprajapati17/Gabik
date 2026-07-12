const mongoose = require('mongoose');
const { Schema } = mongoose;

const assetSchema = new Schema({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'AssetCategory',
    required: true
  },
  assetTag: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true,
    sparse: true
  },
  acquisitionDate: {
    type: Date
  },
  acquisitionCost: {
    type: Number,
    min: 0
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  location: {
    type: String,
    trim: true
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
  documents: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isSharedBookable: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Available', 'Allocated', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'],
    default: 'Available'
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
assetSchema.index({ tenantId: 1, assetTag: 1 });
assetSchema.index({ tenantId: 1, status: 1 });
assetSchema.index({ tenantId: 1, department: 1 });
assetSchema.index({ tenantId: 1, assignedTo: 1 });

module.exports = mongoose.model('Asset', assetSchema);