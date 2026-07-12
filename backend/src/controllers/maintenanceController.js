const MaintenanceRequest = require('../models/MaintenanceRequest');
const Asset = require('../models/Asset');

exports.create = async (req, res) => {
  try {
    const { assetId, issueDescription, priority, photoUrl } = req.body;
    const asset = await Asset.findOne({ _id: assetId, tenantId: req.tenantId });
    if (!asset) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Asset not found' } });
    const mr = new MaintenanceRequest({
      tenantId: req.tenantId, assetId, raisedBy: req.user._id,
      issueDescription, priority, photoUrl
    });
    await mr.save();
    await mr.populate('assetId', 'name assetTag');
    await mr.populate('raisedBy', 'name email');
    res.status(201).json({ data: mr });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.list = async (req, res) => {
  try {
    const { status, priority, assetId } = req.query;
    const filter = { tenantId: req.tenantId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assetId) filter.assetId = assetId;
    if (req.user.role === 'employee') filter.raisedBy = req.user._id;
    const requests = await MaintenanceRequest.find(filter)
      .populate('assetId', 'name assetTag status')
      .populate('raisedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ data: requests });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.approve = async (req, res) => {
  try {
    const mr = await MaintenanceRequest.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!mr) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Maintenance request not found' } });
    if (mr.status !== 'pending') return res.status(400).json({ error: { code: 'INVALID_STATE', message: `Already ${mr.status}` } });
    mr.status = 'approved';
    mr.approvedBy = req.user._id;
    mr.approvedAt = new Date();
    await mr.save();
    const asset = await Asset.findById(mr.assetId);
    if (asset) {
      asset.status = 'under_maintenance';
      await asset.save();
    }
    res.json({ data: mr });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.reject = async (req, res) => {
  try {
    const mr = await MaintenanceRequest.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!mr) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Maintenance request not found' } });
    if (mr.status !== 'pending') return res.status(400).json({ error: { code: 'INVALID_STATE', message: `Already ${mr.status}` } });
    mr.status = 'rejected';
    mr.approvedBy = req.user._id;
    await mr.save();
    res.json({ data: mr });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, technicianName, resolutionNotes } = req.body;
    const validTransitions = { pending: ['approved', 'rejected'], approved: ['technician_assigned'], technician_assigned: ['in_progress'], in_progress: ['resolved'] };
    const mr = await MaintenanceRequest.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!mr) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Maintenance request not found' } });
    if (!validTransitions[mr.status] || !validTransitions[mr.status].includes(status)) {
      return res.status(400).json({ error: { code: 'INVALID_TRANSITION', message: `Cannot transition from ${mr.status} to ${status}` } });
    }
    mr.status = status;
    if (technicianName) mr.technicianName = technicianName;
    if (resolutionNotes) mr.resolutionNotes = resolutionNotes;
    if (status === 'resolved') {
      mr.resolvedAt = new Date();
      const asset = await Asset.findById(mr.assetId);
      if (asset) {
        asset.status = 'available';
        await asset.save();
      }
    }
    await mr.save();
    res.json({ data: mr });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};
