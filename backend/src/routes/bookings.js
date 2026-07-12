const router = require('express').Router();
const { create, list, cancel } = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, list);
router.post('/', authenticate, create);
router.put('/:id/cancel', authenticate, cancel);

module.exports = router;
