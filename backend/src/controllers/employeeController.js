const User = require('../models/User');

exports.list = async (req, res) => {
  try {
    const { departmentId, status } = req.query;
    const filter = { tenantId: req.tenantId };
    if (departmentId) filter.departmentId = departmentId;
    if (status) filter.status = status;
    const users = await User.find(filter).populate('departmentId', 'name').select('-passwordHash');
    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.promoteRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['asset_manager', 'department_head', 'employee'].includes(role)) {
      return res.status(400).json({ error: { code: 'VALIDATION', message: 'Invalid role' } });
    }
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: { role } },
      { new: true }
    ).populate('departmentId', 'name').select('-passwordHash');
    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { departmentId } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: { departmentId } },
      { new: true }
    ).populate('departmentId', 'name').select('-passwordHash');
    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};
