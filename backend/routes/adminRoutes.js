import express from 'express';
import {
  getDashboardStats,
  getStudents,
  updateStudent,
  deactivateStudent,
  sendBulkNotification,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/students', getStudents);
router.put('/students/:id', updateStudent);
router.patch('/students/:id/deactivate', deactivateStudent);
router.post('/notifications/bulk', sendBulkNotification);

export default router;
