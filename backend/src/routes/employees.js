const router = require('express').Router();
const { list, promoteRole, updateDepartment } = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, list);
router.put('/:id/role', authenticate, authorize('admin'), promoteRole);
router.put('/:id/department', authenticate, authorize('admin'), updateDepartment);

module.exports = router;
