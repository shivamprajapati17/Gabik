const mongoose = require('mongoose');
const { Schema } = mongoose;

const resourceSchema = new Schema({
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
    ref: 'ResourceCategory',
    required: true
  },
  resourceTag: {
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
  location: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    min: 1
  },
  features: [{
    type: String,
    trim: true
  }],
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
  isBookable: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Available', 'Booked', 'Under Maintenance', 'Retired', 'Disposed'],
    default: 'Available'
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
resourceSchema.index({ tenantId: 1, resourceTag: 1 });
resourceSchema.index({ tenantId: 1, status: 1 });
resourceSchema.index({ tenantId: 1, department: 1 });

module.exports = mongoose.model('Resource', resourceSchema);