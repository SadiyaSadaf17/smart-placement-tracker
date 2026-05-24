import express from 'express';
import {
  getDashboardStats,
  getStudents,
  updateStudent,
  deactivateStudent,
  resendStudentPasswordReset,
  sendBulkNotification,
} from '../controllers/adminController.js';
import {
  commitStudentBulkUploadBatch,
  downloadStudentBulkUploadErrors,
  getStudentBulkUploadBatch,
  previewStudentBulkUpload,
} from '../controllers/studentBulkUploadController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadStudentBulkFile } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/students', getStudents);
router.post('/students/bulk/preview', uploadStudentBulkFile.single('file'), previewStudentBulkUpload);
router.get('/students/bulk/:batchId', getStudentBulkUploadBatch);
router.post('/students/bulk/:batchId/commit', commitStudentBulkUploadBatch);
router.get('/students/bulk/:batchId/errors', downloadStudentBulkUploadErrors);
router.put('/students/:id', updateStudent);
router.patch('/students/:id/deactivate', deactivateStudent);
router.post('/students/:id/password-reset', resendStudentPasswordReset);
router.post('/notifications/bulk', sendBulkNotification);

export default router;
