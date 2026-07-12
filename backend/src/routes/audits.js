const router = require('express').Router();
const { createCycle, listCycles, getCycle, verifyAsset, closeCycle } = require('../controllers/auditController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, listCycles);
router.get('/:id', authenticate, getCycle);
router.post('/', authenticate, authorize('admin', 'asset_manager'), createCycle);
router.put('/verification/:verificationId', authenticate, verifyAsset);
router.put('/:id/close', authenticate, authorize('admin', 'asset_manager'), closeCycle);

module.exports = router;
