const Tenant = require('./Tenant');
const User = require('./User');
const Department = require('./Department');
const AssetCategory = require('./AssetCategory');
const Asset = require('./Asset');
const Allocation = require('./Allocation');
const TransferRequest = require('./TransferRequest');
const Resource = require('./Resource');
const Booking = require('./Booking');
const MaintenanceRequest = require('./MaintenanceRequest');
const AuditCycle = require('./AuditCycle');
const AuditAuditor = require('./AuditAuditor');
const AuditVerification = require('./AuditVerification');
const Notification = require('./Notification');
const ActivityLog = require('./ActivityLog');

module.exports = {
  Tenant, User, Department, AssetCategory, Asset, Allocation,
  TransferRequest, Resource, Booking, MaintenanceRequest,
  AuditCycle, AuditAuditor, AuditVerification, Notification, ActivityLog
};
