import express from 'express';
import {
  applyForDrive,
  getMyApplications,
  getDriveApplications,
  updateApplicationRound,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/apply/:driveId', authorize('student'), applyForDrive);
router.get('/my', authorize('student'), getMyApplications);
router.get('/drive/:driveId', authorize('admin'), getDriveApplications);
router.put('/:id/round', authorize('admin'), updateApplicationRound);

export default router;
