const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const crypto = require('crypto');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'gabik-secret-key', { expiresIn: '15m' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, process.env.JWT_SECRET || 'gabik-secret-key', { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, organizationName } = req.body;
    if (!name || !email || !password || !organizationName) {
      return res.status(400).json({ error: { code: 'VALIDATION', message: 'name, email, password, organizationName required' } });
    }
    let tenant = await Tenant.findOne({ domain: organizationName.toLowerCase().replace(/\s+/g, '-') });
    if (!tenant) {
      tenant = new Tenant({
        name: organizationName,
        domain: organizationName.toLowerCase().replace(/\s+/g, '-')
      });
      await tenant.save();
    }
    const existingUser = await User.findOne({ tenantId: tenant._id, email });
    if (existingUser) {
      return res.status(400).json({ error: { code: 'DUPLICATE', message: 'User already exists in this organization' } });
    }
    const user = new User({
      tenantId: tenant._id,
      name,
      email,
      passwordHash: password,
      role: 'employee'
    });
    await user.save();
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    res.status(201).json({ token, refreshToken, user: user.toSafeObject() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: { code: 'VALIDATION', message: 'email and password required' } });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ error: { code: 'ACCOUNT_INACTIVE', message: 'Account is inactive' } });
    }
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    res.json({ token, refreshToken, user: user.toSafeObject() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: { code: 'VALIDATION', message: 'refreshToken required' } });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'gabik-secret-key');
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid refresh token' } });
    }
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not found or inactive' } });
    }
    const token = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    res.json({ token, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid refresh token' } });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};
