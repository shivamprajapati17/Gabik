const AuditCycle = require('../models/AuditCycle');
const AuditAuditor = require('../models/AuditAuditor');
const AuditVerification = require('../models/AuditVerification');
const Asset = require('../models/Asset');

exports.createCycle = async (req, res) => {
  try {
    const { name, scopeDepartmentId, scopeLocation, startDate, endDate, auditorIds } = req.body;
    const cycle = new AuditCycle({
      tenantId: req.tenantId, name, scopeDepartmentId, scopeLocation,
      startDate, endDate, createdBy: req.user._id
    });
    await cycle.save();
    if (auditorIds && auditorIds.length) {
      const auditors = auditorIds.map(uid => ({ auditCycleId: cycle._id, userId: uid }));
      await AuditAuditor.insertMany(auditors);
    }
    const filter = { tenantId: req.tenantId };
    if (scopeDepartmentId) filter.departmentId = scopeDepartmentId;
    if (scopeLocation) filter.location = { $regex: scopeLocation, $options: 'i' };
    const assets = await Asset.find(filter);
    const verifications = assets.map(a => ({
      tenantId: req.tenantId, auditCycleId: cycle._id, assetId: a._id,
      expectedLocation: a.location
    }));
    if (verifications.length) await AuditVerification.insertMany(verifications);
    res.status(201).json({ data: cycle, totalAssets: assets.length });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.listCycles = async (req, res) => {
  try {
    const cycles = await AuditCycle.find({ tenantId: req.tenantId })
      .populate('scopeDepartmentId', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ data: cycles });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.getCycle = async (req, res) => {
  try {
    const cycle = await AuditCycle.findOne({ _id: req.params.id, tenantId: req.tenantId })
      .populate('scopeDepartmentId', 'name')
      .populate('createdBy', 'name email');
    if (!cycle) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Audit cycle not found' } });
    const auditors = await AuditAuditor.find({ auditCycleId: cycle._id }).populate('userId', 'name email');
    const verifications = await AuditVerification.find({ auditCycleId: cycle._id })
      .populate('assetId', 'name assetTag serialNumber location')
      .populate('verifiedBy', 'name email');
    res.json({ data: { ...cycle.toObject(), auditors, verifications } });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.verifyAsset = async (req, res) => {
  try {
    const { verification, notes } = req.body;
    if (!['verified', 'missing', 'damaged'].includes(verification)) {
      return res.status(400).json({ error: { code: 'VALIDATION', message: 'Invalid verification status' } });
    }
    const v = await AuditVerification.findOne({ _id: req.params.verificationId }).populate('auditCycleId');
    if (!v) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Verification record not found' } });
    if (v.auditCycleId.status === 'closed') return res.status(400).json({ error: { code: 'CYCLE_CLOSED', message: 'Audit cycle is closed' } });
    if (v.auditCycleId.tenantId.toString() !== req.tenantId.toString()) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    v.verification = verification;
    v.verifiedBy = req.user._id;
    v.verifiedAt = new Date();
    v.notes = notes || '';
    await v.save();
    res.json({ data: v });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};

exports.closeCycle = async (req, res) => {
  try {
    const cycle = await AuditCycle.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!cycle) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Audit cycle not found' } });
    if (cycle.status === 'closed') return res.status(400).json({ error: { code: 'CYCLE_CLOSED', message: 'Audit cycle is already closed' } });
    const unverified = await AuditVerification.countDocuments({ auditCycleId: cycle._id, verification: 'pending' });
    const verifications = await AuditVerification.find({ auditCycleId: cycle._id });
    const missing = verifications.filter(v => v.verification === 'missing');
    const damaged = verifications.filter(v => v.verification === 'damaged');
    for (const v of missing) {
      await Asset.findByIdAndUpdate(v.assetId, { $set: { status: 'lost' } });
    }
    cycle.status = 'closed';
    cycle.closedAt = new Date();
    await cycle.save();
    res.json({
      data: cycle,
      summary: { total: verifications.length, missing: missing.length, damaged: damaged.length, unverified }
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error' } });
  }
};
