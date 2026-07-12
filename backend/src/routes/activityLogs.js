const router = require('express').Router();
const { list } = require('../controllers/activityLogController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, list);

module.exports = router;
