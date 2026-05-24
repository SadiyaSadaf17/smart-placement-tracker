import asyncHandler from '../utils/asyncHandler.js';
import ScoreHistory from '../models/ScoreHistory.js';
import {
  getOrCreateReadinessScore,
  getReadinessAnalytics,
  recalculateReadinessScore,
} from '../services/readinessScoreService.js';

export const calculateReadinessScore = asyncHandler(async (req, res) => {
  const score = await recalculateReadinessScore(req.student, { force: req.query.force === 'true' });
  res.json({ success: true, data: score });
});

export const getCurrentReadinessScore = asyncHandler(async (req, res) => {
  const score = await getOrCreateReadinessScore(req.student);
  res.json({ success: true, data: score });
});

export const getScoreHistory = asyncHandler(async (req, res) => {
  const { limit = 30 } = req.query;
  const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 100);

  const history = await ScoreHistory.find({ student: req.student._id })
    .sort({ calculatedAt: -1 })
    .limit(safeLimit);

  res.json({ success: true, data: history });
});

export const getReadinessProgress = asyncHandler(async (req, res) => {
  const analytics = await getReadinessAnalytics(req.student._id);
  res.json({ success: true, data: analytics });
});
