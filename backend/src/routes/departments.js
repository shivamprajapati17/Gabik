const router = require('express').Router();
const { list, create, update } = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, list);
router.post('/', authenticate, authorize('admin'), create);
router.put('/:id', authenticate, authorize('admin'), update);

module.exports = router;
