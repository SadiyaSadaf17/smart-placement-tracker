import express from 'express';
import {
  createDrive,
  getDrives,
  getDriveById,
  updateDrive,
  deleteDrive,
  getEligibleStudents,
  previewDriveEligibility,
  recalculateDriveEligibility,
  notifyDriveEligibleStudents,
  downloadDriveEligibilityReport,
  transitionDriveWorkflowStage,
} from '../controllers/driveController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getDrives);
router.get('/:id/eligible-students', protect, authorize('admin'), getEligibleStudents);
router.get('/:id/eligibility-preview', protect, authorize('admin'), previewDriveEligibility);
router.post('/:id/eligibility-recalculate', protect, authorize('admin'), recalculateDriveEligibility);
router.post('/:id/notify-eligible', protect, authorize('admin'), notifyDriveEligibleStudents);
router.get('/:id/eligibility-report', protect, authorize('admin'), downloadDriveEligibilityReport);
router.patch('/:id/workflow', protect, authorize('admin'), transitionDriveWorkflowStage);
router.get('/:id', protect, getDriveById);

router.post('/', protect, authorize('admin'), createDrive);
router.post('/eligibility-preview', protect, authorize('admin'), previewDriveEligibility);
router.put('/:id', protect, authorize('admin'), updateDrive);
router.delete('/:id', protect, authorize('admin'), deleteDrive);

export default router;
