import express from 'express';
import {
  applyForDrive,
  getMyApplications,
  getAllApplications,
  getDriveApplications,
  updateApplicationRound,
} from '../controllers/applicationController.js';
import { protect, authorize, requireStudent } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/apply/:driveId', authorize('student'), requireStudent, applyForDrive);
router.get('/my', authorize('student'), getMyApplications);
router.get('/', authorize('admin'), getAllApplications);
router.get('/drive/:driveId', authorize('admin'), getDriveApplications);
router.put('/:id/round', authorize('admin'), updateApplicationRound);

export default router;
