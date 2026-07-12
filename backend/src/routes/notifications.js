const router = require('express').Router();
const { list, markRead, markAllRead } = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, list);
router.put('/mark-read', authenticate, markRead);
router.put('/mark-all-read', authenticate, markAllRead);

module.exports = router;
