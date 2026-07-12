const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true, trim: true },
  headUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  parentDepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

departmentSchema.index({ tenantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);
