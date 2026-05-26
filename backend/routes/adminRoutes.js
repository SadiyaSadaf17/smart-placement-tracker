import express from 'express';
import {
  getDashboardStats,
  getStudents,
  updateStudent,
  deactivateStudent,
  resendStudentPasswordReset,
  sendBulkNotification,
  getStudentProfileDetail,
} from '../controllers/adminController.js';
import {
  commitStudentBulkUploadBatch,
  downloadStudentBulkUploadErrors,
  getStudentBulkUploadBatch,
  previewStudentBulkUpload,
} from '../controllers/studentBulkUploadController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';
import { uploadStudentBulkFile } from '../middleware/uploadMiddleware.js';
import { PERMISSIONS } from '../config/rbac.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', requirePermission(PERMISSIONS.VIEW_DASHBOARD), getDashboardStats);
router.get('/students', requirePermission(PERMISSIONS.VIEW_STUDENTS), getStudents);
router.get('/students/:id/detail', requirePermission(PERMISSIONS.VIEW_STUDENTS), getStudentProfileDetail);
router.post('/students/bulk/preview', requirePermission(PERMISSIONS.MANAGE_STUDENTS), uploadStudentBulkFile.single('file'), previewStudentBulkUpload);
router.get('/students/bulk/:batchId', requirePermission(PERMISSIONS.MANAGE_STUDENTS), getStudentBulkUploadBatch);
router.post('/students/bulk/:batchId/commit', requirePermission(PERMISSIONS.MANAGE_STUDENTS), commitStudentBulkUploadBatch);
router.get('/students/bulk/:batchId/errors', requirePermission(PERMISSIONS.MANAGE_STUDENTS), downloadStudentBulkUploadErrors);
router.put('/students/:id', requirePermission(PERMISSIONS.MANAGE_STUDENTS), updateStudent);
router.patch('/students/:id/deactivate', requirePermission(PERMISSIONS.MANAGE_STUDENTS), deactivateStudent);
router.post('/students/:id/password-reset', requirePermission(PERMISSIONS.MANAGE_STUDENTS), resendStudentPasswordReset);
router.post('/notifications/bulk', requirePermission(PERMISSIONS.SEND_NOTIFICATIONS), sendBulkNotification);

export default router;
