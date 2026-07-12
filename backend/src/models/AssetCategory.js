const mongoose = require('mongoose');
const { Schema } = mongoose;

const assetCategorySchema = new Schema({
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
  description: {
    type: String,
    trim: true
  },
  // Custom fields specific to this category (e.g., warranty period for electronics)
  customFields: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean', 'select'],
      required: true
    },
    options: {
      type: [String], // for select type
      default: []
    },
    required: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AssetCategory', assetCategorySchema);