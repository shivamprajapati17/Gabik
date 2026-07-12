const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', default: null },
  name: { type: String, required: true, trim: true },
  capacity: { type: Number, default: null }
}, { timestamps: true });

resourceSchema.index({ tenantId: 1, name: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
