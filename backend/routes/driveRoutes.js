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
import { protect, requirePermission } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../config/rbac.js';

const router = express.Router();

router.get('/', protect, getDrives);
router.get('/:id/eligible-students', protect, requirePermission(PERMISSIONS.VIEW_STUDENTS), getEligibleStudents);
router.get('/:id/eligibility-preview', protect, requirePermission(PERMISSIONS.VIEW_STUDENTS), previewDriveEligibility);
router.post('/:id/eligibility-recalculate', protect, requirePermission(PERMISSIONS.MANAGE_DRIVES), recalculateDriveEligibility);
router.post('/:id/notify-eligible', protect, requirePermission(PERMISSIONS.SEND_NOTIFICATIONS), notifyDriveEligibleStudents);
router.get('/:id/eligibility-report', protect, requirePermission(PERMISSIONS.VIEW_REPORTS), downloadDriveEligibilityReport);
router.patch('/:id/workflow', protect, requirePermission(PERMISSIONS.MANAGE_DRIVES), transitionDriveWorkflowStage);
router.get('/:id', protect, getDriveById);

router.post('/', protect, requirePermission(PERMISSIONS.MANAGE_DRIVES), createDrive);
router.post('/eligibility-preview', protect, requirePermission(PERMISSIONS.MANAGE_DRIVES), previewDriveEligibility);
router.put('/:id', protect, requirePermission(PERMISSIONS.MANAGE_DRIVES), updateDrive);
router.delete('/:id', protect, requirePermission(PERMISSIONS.MANAGE_DRIVES), deleteDrive);

export default router;
