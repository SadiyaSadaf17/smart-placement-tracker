import express from 'express';
import { createSchedule, getMySchedules, getSchedules, updateAttendance } from '../controllers/scheduleController.js';
import { authorize, protect, requirePermission, requireStudent } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../config/rbac.js';

const router = express.Router();

router.use(protect);
router.get('/my', authorize('student'), requireStudent, getMySchedules);
router.get('/', requirePermission(PERMISSIONS.VIEW_APPLICATIONS), getSchedules);
router.post('/', requirePermission(PERMISSIONS.MANAGE_APPLICATIONS), createSchedule);
router.patch('/:id/attendance', requirePermission(PERMISSIONS.MANAGE_APPLICATIONS), updateAttendance);

export default router;
