import express from 'express';
import {
  calculateReadinessScore,
  getCurrentReadinessScore,
  getReadinessProgress,
  getScoreHistory,
} from '../controllers/readinessScoreController.js';
import { authorize, protect, requireStudent } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('student'), requireStudent);

router.post('/calculate', calculateReadinessScore);
router.get('/current', getCurrentReadinessScore);
router.get('/history', getScoreHistory);
router.get('/analytics', getReadinessProgress);

export default router;
