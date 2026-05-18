import express from 'express';
import {
  exportStudentsPDF,
  exportStudentsExcel,
  exportApplicationsExcel,
  getSummaryReport,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/summary', getSummaryReport);
router.get('/students/pdf', exportStudentsPDF);
router.get('/students/excel', exportStudentsExcel);
router.get('/applications/excel', exportApplicationsExcel);

export default router;
