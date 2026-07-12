const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => { res.json({ message: 'Welcome to Gabik API' }); });

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/departments', require('./src/routes/departments'));
app.use('/api/asset-categories', require('./src/routes/assetCategories'));
app.use('/api/employees', require('./src/routes/employees'));
app.use('/api/assets', require('./src/routes/assets'));
app.use('/api/allocations', require('./src/routes/allocations'));
app.use('/api/transfer-requests', require('./src/routes/transferRequests'));
app.use('/api/resources', require('./src/routes/resources'));
app.use('/api/bookings', require('./src/routes/bookings'));
app.use('/api/maintenance-requests', require('./src/routes/maintenance'));
app.use('/api/audits', require('./src/routes/audits'));
app.use('/api/notifications', require('./src/routes/notifications'));
app.use('/api/activity-logs', require('./src/routes/activityLogs'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/reports', require('./src/routes/reports'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Something went wrong!' } });
});

app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

async function connectDb() {
  if (mongoose.connection.readyState === 1) return;
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    await mongoose.connect(mongoUri);
  } else {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('Using in-memory MongoDB');
    global.__MONGOD__ = mongod;
  }
  console.log('Connected to MongoDB');
}

async function autoSeed() {
  const Tenant = require('./src/models/Tenant');
  const User = require('./src/models/User');
  const Department = require('./src/models/Department');
  const AssetCategory = require('./src/models/AssetCategory');
  const Asset = require('./src/models/Asset');
  const Resource = require('./src/models/Resource');

  const existing = await Tenant.findOne({ domain: 'demo' });
  if (existing) return;
  console.log('Seeding demo data...');

  const t = await Tenant.create({ name: 'Demo Organization', domain: 'demo' });
  const eng = await Department.create({ tenantId: t._id, name: 'Engineering' });
  const fac = await Department.create({ tenantId: t._id, name: 'Facilities' });
  const hr = await Department.create({ tenantId: t._id, name: 'Human Resources' });

  const admin = await User.create({ tenantId: t._id, name: 'Admin User', email: 'admin@gabik.com', passwordHash: 'password123', role: 'admin', departmentId: eng._id });
  await User.create({ tenantId: t._id, name: 'Asset Manager', email: 'manager@gabik.com', passwordHash: 'password123', role: 'asset_manager', departmentId: eng._id });
  const dh = await User.create({ tenantId: t._id, name: 'Dept Head', email: 'head@gabik.com', passwordHash: 'password123', role: 'department_head', departmentId: eng._id });
  await User.create({ tenantId: t._id, name: 'Employee', email: 'employee@gabik.com', passwordHash: 'password123', role: 'employee', departmentId: fac._id });
  eng.headUserId = dh._id; await eng.save();

  const elec = await AssetCategory.create({ tenantId: t._id, name: 'Electronics', customFields: { warrantyPeriodMonths: 24 } });
  const furn = await AssetCategory.create({ tenantId: t._id, name: 'Furniture' });
  const veh = await AssetCategory.create({ tenantId: t._id, name: 'Vehicles' });

  await Asset.insertMany([
    { tenantId: t._id, assetTag: 'AF-0001', name: 'MacBook Pro 16"', categoryId: elec._id, serialNumber: 'SN-MBP-001', condition: 'good', location: 'Building A-201', status: 'available', isBookable: false, departmentId: eng._id },
    { tenantId: t._id, assetTag: 'AF-0002', name: 'Dell Monitor 27"', categoryId: elec._id, serialNumber: 'SN-DM-002', condition: 'good', location: 'Building A-202', status: 'allocated', isBookable: false, departmentId: eng._id },
    { tenantId: t._id, assetTag: 'AF-0003', name: 'Standing Desk', categoryId: furn._id, serialNumber: 'SN-SD-003', condition: 'fair', location: 'Building B-101', status: 'available', isBookable: false, departmentId: fac._id },
    { tenantId: t._id, assetTag: 'AF-0004', name: 'Office Chair', categoryId: furn._id, serialNumber: 'SN-OC-004', condition: 'good', location: 'Building B-102', status: 'available', isBookable: false, departmentId: fac._id },
    { tenantId: t._id, assetTag: 'AF-0005', name: 'Conference Projector', categoryId: elec._id, serialNumber: 'SN-CRP-005', condition: 'good', location: 'Building A-301', status: 'available', isBookable: true, departmentId: eng._id },
    { tenantId: t._id, assetTag: 'AF-0006', name: 'Toyota Prius (Pool Car)', categoryId: veh._id, serialNumber: 'SN-TP-006', condition: 'good', location: 'Parking Lot B', status: 'available', isBookable: true, departmentId: fac._id },
    { tenantId: t._id, assetTag: 'AF-0007', name: 'Server Rack - Dell', categoryId: elec._id, serialNumber: 'SN-SR-007', condition: 'fair', location: 'Server Room A', status: 'under_maintenance', isBookable: false, departmentId: eng._id },
    { tenantId: t._id, assetTag: 'AF-0008', name: 'Mobile Whiteboard', categoryId: furn._id, serialNumber: 'SN-WB-008', condition: 'poor', location: 'Building A-203', status: 'available', isBookable: false, departmentId: eng._id },
  ]);

  await Resource.insertMany([
    { tenantId: t._id, name: 'Conference Room A', capacity: 10 },
    { tenantId: t._id, name: 'Conference Room B', capacity: 6 },
    { tenantId: t._id, name: 'Meeting Pod 1', capacity: 2 },
  ]);

  console.log('Demo data seeded');
  console.log('Logins (password: password123):');
  console.log('  admin@gabik.com (Admin)');
  console.log('  manager@gabik.com (Asset Manager)');
  console.log('  head@gabik.com (Dept Head)');
  console.log('  employee@gabik.com (Employee)');
}

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDb().then(autoSeed).then(() => {
    app.listen(PORT, () => { console.log(`Server running on http://localhost:${PORT}`); });
  }).catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
}

module.exports = { app, connectDb };
