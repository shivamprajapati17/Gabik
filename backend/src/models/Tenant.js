const mongoose = require('mongoose');
const { Schema } = mongoose;

const tenantSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tenant', tenantSchema);