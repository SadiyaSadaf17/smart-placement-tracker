import express from 'express';
import {
  applyForDrive,
  getMyApplications,
  getMyApplicationTimeline,
  getAllApplications,
  getDriveApplications,
  updateApplicationRound,
} from '../controllers/applicationController.js';
import { protect, authorize, requireStudent } from '../middleware/authMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/apply/:driveId', authorize('student'), requireStudent, uploadResume.single('resume'), applyForDrive);
router.get('/my', authorize('student'), getMyApplications);
router.get('/my/timeline', authorize('student'), requireStudent, getMyApplicationTimeline);
router.get('/', authorize('admin'), getAllApplications);
router.get('/drive/:driveId', authorize('admin'), getDriveApplications);
router.put('/:id/round', authorize('admin'), updateApplicationRound);

export default router;
