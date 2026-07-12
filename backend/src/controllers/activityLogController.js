const ActivityLog = require('../models/ActivityLog');

exports.list = async (req, res) => {
  try {
    const { entityType, action } = req.query;
    const filter = { tenantId: req.tenantId };
    if (entityType) filter.entityType = entityType;
    if (action) filter.action = action;
    const logs = await ActivityLog.find(filter)
      .populate('actorUserId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ data: logs });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};
