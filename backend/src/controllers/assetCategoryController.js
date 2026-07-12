const AssetCategory = require('../models/AssetCategory');

exports.list = async (req, res) => {
  try {
    const categories = await AssetCategory.find({ tenantId: req.tenantId });
    res.json({ data: categories });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, customFields } = req.body;
    const category = new AssetCategory({ tenantId: req.tenantId, name, customFields });
    await category.save();
    res.status(201).json({ data: category });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: { code: 'DUPLICATE', message: 'Category name already exists' } });
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, customFields } = req.body;
    const category = await AssetCategory.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: { name, customFields } },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } });
    res.json({ data: category });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};
