const router = require('express').Router();
const { create, list, approve, reject, updateStatus } = require('../controllers/maintenanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, list);
router.post('/', authenticate, create);
router.put('/:id/approve', authenticate, authorize('admin', 'asset_manager'), approve);
router.put('/:id/reject', authenticate, authorize('admin', 'asset_manager'), reject);
router.put('/:id/status', authenticate, authorize('admin', 'asset_manager'), updateStatus);

module.exports = router;
