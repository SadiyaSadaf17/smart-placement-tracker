import AuditLog from '../models/AuditLog.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25, actionType, targetEntity, actorRole, from, to } = req.query;
  const query = {};

  if (actionType) query.actionType = actionType;
  if (targetEntity) query.targetEntity = targetEntity;
  if (actorRole) query.actorRole = actorRole;
  if (from || to) {
    query.timestamp = {};
    if (from) query.timestamp.$gte = new Date(from);
    if (to) query.timestamp.$lte = new Date(to);
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const [total, logs] = await Promise.all([
    AuditLog.countDocuments(query),
    AuditLog.find(query)
      .populate('actorId', 'email role')
      .sort({ timestamp: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
  ]);

  res.json({
    success: true,
    data: logs,
    pagination: { page: safePage, limit: safeLimit, total },
  });
});
