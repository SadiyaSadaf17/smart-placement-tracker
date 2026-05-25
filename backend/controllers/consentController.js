import ConsentHistory from '../models/ConsentHistory.js';
import Student from '../models/Student.js';
import asyncHandler from '../utils/asyncHandler.js';
import { logAudit } from '../services/auditService.js';

export const updateMyConsent = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  if (!['interested', 'not_interested', 'higher_studies', 'pending'].includes(status)) {
    res.status(400);
    throw new Error('Invalid consent status');
  }

  const previousStatus = req.student.placementConsentStatus;
  req.student.placementConsentStatus = status;
  await req.student.save();
  await ConsentHistory.create({ student: req.student._id, previousStatus, newStatus: status, changedBy: req.user._id, remarks });
  await logAudit({ actor: req.user, actionType: 'CONSENT_UPDATED', targetEntity: 'Student', targetId: req.student._id, oldValues: { placementConsentStatus: previousStatus }, newValues: { placementConsentStatus: status }, ipAddress: req.ip });
  res.json({ success: true, data: req.student });
});

export const getConsentAnalytics = asyncHandler(async (req, res) => {
  const stats = await Student.aggregate([{ $group: { _id: '$placementConsentStatus', count: { $sum: 1 } } }]);
  res.json({ success: true, data: stats });
});
