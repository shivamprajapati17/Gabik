const router = require('express').Router();
const { list, getById, create, update } = require('../controllers/assetController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, list);
router.get('/:id', authenticate, getById);
router.post('/', authenticate, authorize('admin', 'asset_manager'), create);
router.put('/:id', authenticate, authorize('admin', 'asset_manager'), update);

module.exports = router;
