const Notification = require('../models/Notification');

exports.list = async (req, res) => {
  try {
    const { type, unread } = req.query;
    const filter = { tenantId: req.tenantId, userId: req.user._id };
    if (type) filter.type = type;
    if (unread === 'true') filter.readAt = null;
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ tenantId: req.tenantId, userId: req.user._id, readAt: null });
    res.json({ data: notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { ids } = req.body;
    await Notification.updateMany(
      { _id: { $in: ids }, tenantId: req.tenantId, userId: req.user._id },
      { $set: { readAt: new Date() } }
    );
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { tenantId: req.tenantId, userId: req.user._id, readAt: null },
      { $set: { readAt: new Date() } }
    );
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};
