const router = require('express').Router();
const { create, list, getById, approve, reject } = require('../controllers/transferRequestController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, list);
router.get('/:id', authenticate, getById);
router.post('/', authenticate, create);
router.put('/:id/approve', authenticate, authorize('admin', 'asset_manager', 'department_head'), approve);
router.put('/:id/reject', authenticate, authorize('admin', 'asset_manager', 'department_head'), reject);

module.exports = router;
