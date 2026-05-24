import asyncHandler from '../utils/asyncHandler.js';
import { getPlacementAnalytics } from '../services/analyticsService.js';

export const getAnalytics = asyncHandler(async (req, res) => {
  const data = await getPlacementAnalytics(req.query);
  res.json({ success: true, data });
});
