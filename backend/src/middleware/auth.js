const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', async (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      // Attach user to request object
      req.user = await User.findById(user.id).select('-password');
      if (!req.user) {
        return res.status(404).json({ message: 'User not found' });
      }

      next();
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check user role
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware to validate request
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({ errors: errors.array() });
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
  validate
};