const router = require('express').Router();
const { register, login, refreshToken, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/me', authenticate, getMe);

module.exports = router;
