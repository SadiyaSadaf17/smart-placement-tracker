import express from 'express';
import { listResumes, downloadResumeZip } from '../controllers/resumeRepositoryController.js';
import { createMockTest, getMockTestById, getMockTests, getMyMockAnalytics, getMyMockResults, submitMockTest } from '../controllers/mockTestController.js';
import { createInterviewFeedback, getFeedback, getFeedbackAnalytics } from '../controllers/interviewFeedbackController.js';
import { getConsentAnalytics, updateMyConsent } from '../controllers/consentController.js';
import { createCalendarEvent, getCalendarEvents } from '../controllers/calendarController.js';
import { createTrainingProgram, getTrainingAnalytics, getTrainingPrograms, markTrainingAttendance } from '../controllers/trainingController.js';
import { downloadTemplate, listTemplates } from '../controllers/templateController.js';
import { bulkStatusCommit, bulkStatusPreview } from '../controllers/bulkStatusController.js';
import { exportAdvancedReport, getAdvancedReport } from '../controllers/advancedReportController.js';
import { authorize, protect, requirePermission, requireStudent } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../config/rbac.js';
import { uploadStudentBulkFile } from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/resumes', requirePermission(PERMISSIONS.VIEW_STUDENTS), listResumes);
router.get('/resumes/zip', requirePermission(PERMISSIONS.VIEW_STUDENTS), downloadResumeZip);

router.get('/mock-tests', getMockTests);
router.post('/mock-tests', requirePermission(PERMISSIONS.MANAGE_STUDENTS), createMockTest);
router.get('/mock-tests/my/results', authorize('student'), requireStudent, getMyMockResults);
router.get('/mock-tests/my/analytics', authorize('student'), requireStudent, getMyMockAnalytics);
router.get('/mock-tests/:id', getMockTestById);
router.post('/mock-tests/:id/submit', authorize('student'), requireStudent, submitMockTest);

router.get('/feedback', getFeedback);
router.get('/feedback/analytics', getFeedbackAnalytics);
router.post('/feedback', requirePermission(PERMISSIONS.MANAGE_APPLICATIONS), createInterviewFeedback);

router.patch('/consent/my', authorize('student'), requireStudent, updateMyConsent);
router.get('/consent/analytics', requirePermission(PERMISSIONS.VIEW_ANALYTICS), getConsentAnalytics);

router.get('/calendar', getCalendarEvents);
router.post('/calendar', requirePermission(PERMISSIONS.MANAGE_DRIVES), createCalendarEvent);

router.get('/training', getTrainingPrograms);
router.get('/training/analytics', getTrainingAnalytics);
router.post('/training', requirePermission(PERMISSIONS.MANAGE_STUDENTS), createTrainingProgram);
router.patch('/training/:id/attendance', requirePermission(PERMISSIONS.MANAGE_STUDENTS), markTrainingAttendance);

router.get('/templates', requirePermission(PERMISSIONS.VIEW_REPORTS), listTemplates);
router.get('/templates/:name', requirePermission(PERMISSIONS.VIEW_REPORTS), downloadTemplate);

router.post('/bulk-status/preview', requirePermission(PERMISSIONS.MANAGE_APPLICATIONS), uploadStudentBulkFile.single('file'), bulkStatusPreview);
router.post('/bulk-status/commit', requirePermission(PERMISSIONS.MANAGE_APPLICATIONS), uploadStudentBulkFile.single('file'), bulkStatusCommit);

router.get('/reports/:type', requirePermission(PERMISSIONS.VIEW_REPORTS), getAdvancedReport);
router.get('/reports/:type/export', requirePermission(PERMISSIONS.VIEW_REPORTS), exportAdvancedReport);

export default router;
