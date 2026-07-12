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

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gabik')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
