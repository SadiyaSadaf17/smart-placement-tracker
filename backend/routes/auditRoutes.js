import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../config/rbac.js';

const router = express.Router();

router.get('/', protect, requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS), getAuditLogs);

export default router;
