const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Access token required' } });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gabik-secret-key');
    const user = await User.findById(decoded.userId).populate('tenantId');
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not found or inactive' } });
    }
    if (user.tenantId.status !== 'active') {
      return res.status(403).json({ error: { code: 'TENANT_SUSPENDED', message: 'Organization is suspended' } });
    }
    req.user = user;
    req.tenantId = user.tenantId._id || user.tenantId;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: { code: 'TOKEN_EXPIRED', message: 'Token expired' } });
    }
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid token' } });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
