const router = require('express').Router();
const { allocate, returnAsset, getActiveAllocation, list } = require('../controllers/allocationController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, list);
router.get('/active/:assetId', authenticate, getActiveAllocation);
router.post('/', authenticate, authorize('admin', 'asset_manager'), allocate);
router.put('/:id/return', authenticate, authorize('admin', 'asset_manager'), returnAsset);

module.exports = router;
