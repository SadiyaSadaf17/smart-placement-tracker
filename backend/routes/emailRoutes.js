import express from 'express';
import { getEmailJobs, runEmailQueue } from '../controllers/emailController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../config/rbac.js';

const router = express.Router();

router.get('/jobs', protect, requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS), getEmailJobs);
router.post('/process', protect, requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS), runEmailQueue);

export default router;
