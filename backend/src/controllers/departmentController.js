const Department = require('../models/Department');

exports.list = async (req, res) => {
  try {
    const departments = await Department.find({ tenantId: req.tenantId }).populate('headUserId', 'name email');
    res.json({ data: departments });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, headUserId, parentDepartmentId } = req.body;
    const dept = new Department({ tenantId: req.tenantId, name, headUserId, parentDepartmentId });
    await dept.save();
    await dept.populate('headUserId', 'name email');
    res.status(201).json({ data: dept });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: { code: 'DUPLICATE', message: 'Department name already exists' } });
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, headUserId, parentDepartmentId, status } = req.body;
    const dept = await Department.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: { name, headUserId, parentDepartmentId, status } },
      { new: true, runValidators: true }
    ).populate('headUserId', 'name email');
    if (!dept) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Department not found' } });
    res.json({ data: dept });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};
