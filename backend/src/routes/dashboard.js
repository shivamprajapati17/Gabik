const router = require('express').Router();
const { getKpis } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getKpis);

module.exports = router;
