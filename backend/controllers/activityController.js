import ActivityLog from '../models/ActivityLog.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, action } = req.query;
  const query = {};
  if (action) query.action = action;

  const total = await ActivityLog.countDocuments(query);
  const logs = await ActivityLog.find(query)
    .populate('user', 'email role')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    success: true,
    data: logs,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
});
