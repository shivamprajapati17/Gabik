const mongoose = require('mongoose');
const { Schema } = mongoose;

const departmentSchema = new Schema({
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
  parentDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  head: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);