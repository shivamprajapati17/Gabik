const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Tenant = require('./src/models/Tenant');
const User = require('./src/models/User');
const Department = require('./src/models/Department');
const AssetCategory = require('./src/models/AssetCategory');
const Asset = require('./src/models/Asset');
const Resource = require('./src/models/Resource');

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  let mongod;
  if (mongoUri) {
    await mongoose.connect(mongoUri);
  } else {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('Using in-memory MongoDB');
  }
  console.log('Connected to MongoDB');

  await mongoose.connection.dropDatabase();
  console.log('Database cleared');

  const tenant = await Tenant.create({ name: 'Demo Organization', domain: 'demo-org' });
  console.log('Created tenant:', tenant.name);

  const engineering = await Department.create({ tenantId: tenant._id, name: 'Engineering' });
  const facilities = await Department.create({ tenantId: tenant._id, name: 'Facilities' });
  const hr = await Department.create({ tenantId: tenant._id, name: 'Human Resources' });
  console.log('Created departments');

  const admin = await User.create({
    tenantId: tenant._id, name: 'Admin User', email: 'admin@gabik.com',
    passwordHash: 'password123', role: 'admin', departmentId: engineering._id
  });
  await User.create({
    tenantId: tenant._id, name: 'Asset Manager', email: 'manager@gabik.com',
    passwordHash: 'password123', role: 'asset_manager', departmentId: engineering._id
  });
  const dh = await User.create({
    tenantId: tenant._id, name: 'Dept Head', email: 'head@gabik.com',
    passwordHash: 'password123', role: 'department_head', departmentId: engineering._id
  });
  await User.create({
    tenantId: tenant._id, name: 'Employee User', email: 'employee@gabik.com',
    passwordHash: 'password123', role: 'employee', departmentId: facilities._id
  });
  console.log('Created users (all passwords: password123)');
  console.log('  Admin:    admin@gabik.com');
  console.log('  Manager:  manager@gabik.com');
  console.log('  DeptHead: head@gabik.com');
  console.log('  Employee: employee@gabik.com');

  engineering.headUserId = dh._id;
  await engineering.save();

  const electronics = await AssetCategory.create({ tenantId: tenant._id, name: 'Electronics', customFields: { warrantyPeriodMonths: 24 } });
  const furniture = await AssetCategory.create({ tenantId: tenant._id, name: 'Furniture' });
  const vehicles = await AssetCategory.create({ tenantId: tenant._id, name: 'Vehicles' });
  console.log('Created asset categories');

  await Asset.insertMany([
    { tenantId: tenant._id, assetTag: 'AF-0001', name: 'MacBook Pro 16"', categoryId: electronics._id, serialNumber: 'SN-MBP-001', condition: 'good', location: 'Building A-201', status: 'available', isBookable: false, departmentId: engineering._id },
    { tenantId: tenant._id, assetTag: 'AF-0002', name: 'Dell Monitor 27"', categoryId: electronics._id, serialNumber: 'SN-DM-002', condition: 'good', location: 'Building A-202', status: 'allocated', isBookable: false, departmentId: engineering._id },
    { tenantId: tenant._id, assetTag: 'AF-0003', name: 'Standing Desk', categoryId: furniture._id, serialNumber: 'SN-SD-003', condition: 'fair', location: 'Building B-101', status: 'available', isBookable: false, departmentId: facilities._id },
    { tenantId: tenant._id, assetTag: 'AF-0004', name: 'Office Chair', categoryId: furniture._id, serialNumber: 'SN-OC-004', condition: 'good', location: 'Building B-102', status: 'available', isBookable: false, departmentId: facilities._id },
    { tenantId: tenant._id, assetTag: 'AF-0005', name: 'Conference Projector', categoryId: electronics._id, serialNumber: 'SN-CRP-005', condition: 'good', location: 'Building A-301', status: 'available', isBookable: true, departmentId: engineering._id },
    { tenantId: tenant._id, assetTag: 'AF-0006', name: 'Toyota Prius (Pool Car)', categoryId: vehicles._id, serialNumber: 'SN-TP-006', condition: 'good', location: 'Parking Lot B', status: 'available', isBookable: true, departmentId: facilities._id },
    { tenantId: tenant._id, assetTag: 'AF-0007', name: 'Server Rack - Dell', categoryId: electronics._id, serialNumber: 'SN-SR-007', condition: 'fair', location: 'Server Room A', status: 'under_maintenance', isBookable: false, departmentId: engineering._id },
    { tenantId: tenant._id, assetTag: 'AF-0008', name: 'Mobile Whiteboard', categoryId: furniture._id, serialNumber: 'SN-WB-008', condition: 'poor', location: 'Building A-203', status: 'available', isBookable: false, departmentId: engineering._id },
  ]);
  console.log('Created 8 assets');

  await Resource.insertMany([
    { tenantId: tenant._id, name: 'Conference Room A', capacity: 10 },
    { tenantId: tenant._id, name: 'Conference Room B', capacity: 6 },
    { tenantId: tenant._id, name: 'Meeting Pod 1', capacity: 2 },
  ]);
  console.log('Created 3 bookable resources');

  console.log('\n--- Seed complete! ---');
  console.log('Start the server: npm start');
  console.log('Frontend: http://localhost:5173');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
