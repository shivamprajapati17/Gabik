const router = require('express').Router();
const { list, create } = require('../controllers/resourceController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, list);
router.post('/', authenticate, authorize('admin', 'asset_manager'), create);

module.exports = router;
