// Models index file
const Tenant = require('./Tenant');
const User = require('./User');
const Department = require('./Department');
const Asset = require('./Asset');
const AssetCategory = require('./AssetCategory');
const Resource = require('./Resource');
const ResourceCategory = require('./ResourceCategory');
const Allocation = require('./Allocation');
const Booking = require('./Booking');
const MaintenanceRequest = require('./MaintenanceRequest');
const AuditLog = require('./AuditLog');

module.exports = {
  Tenant,
  User,
  Department,
  Asset,
  AssetCategory,
  Resource,
  ResourceCategory,
  Allocation,
  Booking,
  MaintenanceRequest,
  AuditLog
};