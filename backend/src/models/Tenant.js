const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  domain: { type: String, required: true, unique: true, trim: true },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  settings: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);
