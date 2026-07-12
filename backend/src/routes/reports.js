const router = require('express').Router();
const { utilization, maintenanceFrequency, idleAssets, upcomingMaintenance, bookingHeatmap } = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/utilization', authenticate, utilization);
router.get('/maintenance-frequency', authenticate, maintenanceFrequency);
router.get('/idle-assets', authenticate, idleAssets);
router.get('/upcoming-maintenance', authenticate, upcomingMaintenance);
router.get('/booking-heatmap', authenticate, bookingHeatmap);

module.exports = router;
