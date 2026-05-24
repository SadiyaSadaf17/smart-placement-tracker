import express from 'express';
import { getPlacementPolicy, updatePlacementPolicy } from '../controllers/policyController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../config/rbac.js';

const router = express.Router();

router.get('/', protect, requirePermission(PERMISSIONS.VIEW_DASHBOARD), getPlacementPolicy);
router.put('/', protect, requirePermission(PERMISSIONS.MANAGE_OFFERS), updatePlacementPolicy);

export default router;
