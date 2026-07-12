const mongoose = require('mongoose');

const ASSET_STATUSES = ['available', 'allocated', 'reserved', 'under_maintenance', 'lost', 'retired', 'disposed'];
const ASSET_CONDITIONS = ['new', 'good', 'fair', 'poor', 'damaged'];

const assetSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  assetTag: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetCategory', required: true },
  serialNumber: { type: String, trim: true, default: '' },
  qrCode: { type: String, trim: true, default: null, sparse: true },
  acquisitionDate: { type: Date },
  acquisitionCost: { type: Number, min: 0, default: 0 },
  condition: { type: String, enum: ASSET_CONDITIONS, default: 'good' },
  location: { type: String, trim: true, default: '' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  status: { type: String, enum: ASSET_STATUSES, default: 'available' },
  isBookable: { type: Boolean, default: false },
  photoUrl: { type: String, default: null }
}, { timestamps: true });

assetSchema.index({ tenantId: 1, assetTag: 1 }, { unique: true });
assetSchema.index({ tenantId: 1, status: 1 });
assetSchema.index({ tenantId: 1, categoryId: 1 });
assetSchema.index({ tenantId: 1, name: 'text', serialNumber: 'text', assetTag: 'text' });

module.exports = mongoose.model('Asset', assetSchema);
module.exports.ASSET_STATUSES = ASSET_STATUSES;
module.exports.ASSET_CONDITIONS = ASSET_CONDITIONS;
