import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadResume,
  getEligibleDrives,
  getStudentAnalytics,
  getAIInsights,
  getLeaderboard,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadResume as uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect, authorize('student'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/resume', uploadMiddleware.single('resume'), uploadResume);
router.get('/drives', getEligibleDrives);
router.get('/analytics', getStudentAnalytics);
router.get('/ai-insights', getAIInsights);
router.get('/leaderboard', getLeaderboard);

export default router;
