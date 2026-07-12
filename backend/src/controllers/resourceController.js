const Resource = require('../models/Resource');
const Asset = require('../models/Asset');

exports.list = async (req, res) => {
  try {
    const resources = await Resource.find({ tenantId: req.tenantId }).populate('assetId', 'name assetTag');
    res.json({ data: resources });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, assetId, capacity } = req.body;
    if (assetId) {
      const asset = await Asset.findOne({ _id: assetId, tenantId: req.tenantId, isBookable: true });
      if (!asset) return res.status(400).json({ error: { code: 'INVALID_ASSET', message: 'Asset not found or not bookable' } });
    }
    const resource = new Resource({ tenantId: req.tenantId, name, assetId, capacity });
    await resource.save();
    res.status(201).json({ data: resource });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};
