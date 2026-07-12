const mongoose = require('mongoose');

const assetCategorySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true, trim: true },
  customFields: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

assetCategorySchema.index({ tenantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('AssetCategory', assetCategorySchema);
