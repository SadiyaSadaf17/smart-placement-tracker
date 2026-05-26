import mongoose from 'mongoose';
import MockTest from '../models/MockTest.js';
import MockTestSubmission from '../models/MockTestSubmission.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, buildPaginationMeta, addSearch } from '../utils/queryUtils.js';
import { logAudit } from '../services/auditService.js';
import { recalculateReadinessScore } from '../services/readinessScoreService.js';
import {
  buildAttemptOrder,
  buildReview,
  isFinishedAttempt,
  normalizeAnswers,
  projectAttemptForStudent,
  remainingSeconds,
  scoreAttempt,
} from '../services/assessmentService.js';

const sanitizeStudentTest = (test) => {
  const payload = test.toObject();
  payload.questions = payload.questions.map(({ correctOption, explanation, ...question }) => question);
  return payload;
};

const parseCsv = (value) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean);

const assertValidQuestions = (questions = []) => {
  questions.forEach((question, index) => {
    if (!question.question?.trim()) {
      const err = new Error(`Question ${index + 1} text is required`);
      err.statusCode = 400;
      throw err;
    }
    if (!Array.isArray(question.options) || question.options.length < 2) {
      const err = new Error(`Question ${index + 1} needs at least two options`);
      err.statusCode = 400;
      throw err;
    }
    if (Number(question.correctOption) >= question.options.length) {
      const err = new Error(`Question ${index + 1} correct option is invalid`);
      err.statusCode = 400;
      throw err;
    }
  });
};

const getPublishedTestForStudent = async (testId) => {
  const test = await MockTest.findById(testId);
  if (!test || !test.isPublished) {
    const err = new Error('Test not found');
    err.statusCode = 404;
    throw err;
  }
  return test;
};

const getAttemptOr404 = async ({ attemptId, studentId, testId }) => {
  const query = { _id: attemptId, student: studentId };
  if (testId) query.test = testId;
  const attempt = await MockTestSubmission.findOne(query);
  if (!attempt) {
    const err = new Error('Attempt not found');
    err.statusCode = 404;
    throw err;
  }
  return attempt;
};

const ensureAttemptOpen = (attempt) => {
  if (isFinishedAttempt(attempt)) {
    const err = new Error('This attempt has already ended');
    err.statusCode = 409;
    throw err;
  }
};

const createSubmittedUpdate = (test, attempt, { autoSubmitted = false, status } = {}) => {
  const result = scoreAttempt(test, attempt.answers || []);
  const now = new Date();
  return {
    ...result,
    status: status || (autoSubmitted ? 'auto_submitted' : 'submitted'),
    autoSubmitted,
    submittedAt: now,
    timeSpentSeconds: Math.max(0, Math.round((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000)),
  };
};

export const createMockTest = asyncHandler(async (req, res) => {
  if (!req.body.title?.trim()) {
    res.status(400);
    throw new Error('Test title is required');
  }
  if (!Number(req.body.durationMinutes) || Number(req.body.durationMinutes) < 1) {
    res.status(400);
    throw new Error('Duration must be at least 1 minute');
  }
  if (!Array.isArray(req.body.questions) || req.body.questions.length === 0) {
    res.status(400);
    throw new Error('At least one question is required');
  }
  assertValidQuestions(req.body.questions);

  const test = await MockTest.create({ ...req.body, createdBy: req.user._id });
  await logAudit({ actor: req.user, actionType: 'MOCK_TEST_CREATED', targetEntity: 'MockTest', targetId: test._id, newValues: test.toObject(), ipAddress: req.ip });
  res.status(201).json({ success: true, data: test });
});

export const updateMockTest = asyncHandler(async (req, res) => {
  if (req.body.questions) assertValidQuestions(req.body.questions);
  const test = await MockTest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!test) {
    res.status(404);
    throw new Error('Test not found');
  }
  await logAudit({ actor: req.user, actionType: 'MOCK_TEST_UPDATED', targetEntity: 'MockTest', targetId: test._id, newValues: test.toObject(), ipAddress: req.ip });
  res.json({ success: true, data: test });
});

export const deleteMockTest = asyncHandler(async (req, res) => {
  const test = await MockTest.findByIdAndDelete(req.params.id);
  if (!test) {
    res.status(404);
    throw new Error('Test not found');
  }
  await logAudit({ actor: req.user, actionType: 'MOCK_TEST_DELETED', targetEntity: 'MockTest', targetId: test._id, oldValues: test.toObject(), ipAddress: req.ip });
  res.json({ success: true, data: { deleted: true } });
});

export const getMockTests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filters = req.user.role === 'student' ? { isPublished: true } : {};
  if (req.query.published !== undefined && req.user.role !== 'student') filters.isPublished = req.query.published === 'true';
  if (req.query.difficulty) filters['questions.difficulty'] = req.query.difficulty;
  if (req.query.section) filters['questions.section'] = req.query.section;
  if (req.query.department) filters.assignedDepartments = req.query.department;

  const query = addSearch(filters, req.query.search, ['title', 'description', 'questions.question', 'questions.tags']);
  const [tests, total] = await Promise.all([
    MockTest.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    MockTest.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: req.user.role === 'student' ? tests.map(sanitizeStudentTest) : tests,
    meta: buildPaginationMeta({ page, limit, total }),
  });
});

export const getMockTestById = asyncHandler(async (req, res) => {
  if (req.user.role === 'student' && !req.student) {
    res.status(404);
    throw new Error('Student profile not found. Complete registration.');
  }

  const test = await MockTest.findById(req.params.id);
  if (!test || (req.user.role === 'student' && !test.isPublished)) {
    res.status(404);
    throw new Error('Test not found');
  }

  const latestAttempt = req.user.role === 'student'
    ? await MockTestSubmission.findOne({ test: test._id, student: req.student?._id }).sort({ attemptNumber: -1 })
    : null;

  res.json({
    success: true,
    data: req.user.role === 'student' ? sanitizeStudentTest(test) : test,
    submission: latestAttempt,
  });
});

export const startMockTestAttempt = asyncHandler(async (req, res) => {
  const test = await getPublishedTestForStudent(req.params.id);
  const latestAttempt = await MockTestSubmission.findOne({ test: test._id, student: req.student._id }).sort({ attemptNumber: -1 });

  if (latestAttempt && !isFinishedAttempt(latestAttempt)) {
    res.json({ success: true, data: projectAttemptForStudent(test, latestAttempt), resumed: true });
    return;
  }

  if (latestAttempt && !test.allowRetake) {
    res.status(409);
    throw new Error('This mock test has already been submitted');
  }

  const attemptNumber = (latestAttempt?.attemptNumber || 0) + 1;
  if (attemptNumber > (test.maxAttempts || 1)) {
    res.status(409);
    throw new Error('Maximum attempts reached');
  }

  const now = new Date();
  const attempt = await MockTestSubmission.create({
    test: test._id,
    student: req.student._id,
    attemptNumber,
    startedAt: now,
    endsAt: new Date(now.getTime() + Number(test.durationMinutes) * 60 * 1000),
    ...buildAttemptOrder(test),
  });

  res.status(201).json({ success: true, data: projectAttemptForStudent(test, attempt), resumed: false });
});

export const getActiveMockAttempt = asyncHandler(async (req, res) => {
  const attempt = await getAttemptOr404({ attemptId: req.params.attemptId, studentId: req.student._id });
  const test = await MockTest.findById(attempt.test);
  res.json({ success: true, data: projectAttemptForStudent(test, attempt) });
});

export const autosaveMockAttempt = asyncHandler(async (req, res) => {
  const attempt = await getAttemptOr404({ attemptId: req.params.attemptId, studentId: req.student._id });
  ensureAttemptOpen(attempt);
  const test = await MockTest.findById(attempt.test);

  if (remainingSeconds(attempt) <= 0) {
    Object.assign(attempt, createSubmittedUpdate(test, attempt, { autoSubmitted: true, status: 'expired' }));
    await attempt.save();
    res.status(409).json({ success: false, message: 'Attempt expired and was auto-submitted', data: attempt });
    return;
  }

  attempt.answers = normalizeAnswers(req.body.answers || [], test.questions);
  attempt.lastSavedAt = new Date();
  await attempt.save();

  res.json({ success: true, data: { lastSavedAt: attempt.lastSavedAt, remainingSeconds: remainingSeconds(attempt) } });
});

export const recordAntiCheatEvent = asyncHandler(async (req, res) => {
  const attempt = await getAttemptOr404({ attemptId: req.params.attemptId, studentId: req.student._id });
  ensureAttemptOpen(attempt);
  const test = await MockTest.findById(attempt.test);
  const type = req.body.type;
  const allowed = ['tab_switch', 'fullscreen_exit', 'copy', 'paste', 'window_blur', 'manual'];
  if (!allowed.includes(type)) {
    res.status(400);
    throw new Error('Invalid anti-cheat event type');
  }

  if (type === 'tab_switch' || type === 'window_blur') attempt.antiCheat.tabSwitches += 1;
  if (type === 'fullscreen_exit') attempt.antiCheat.fullscreenExits += 1;
  if (type === 'copy') attempt.antiCheat.copyAttempts += 1;
  if (type === 'paste') attempt.antiCheat.pasteAttempts += 1;
  attempt.antiCheat.suspiciousEvents.push({ type, detail: req.body.detail });

  const limits = test.antiCheat || {};
  const exceeded = (limits.maxTabSwitches >= 0 && attempt.antiCheat.tabSwitches > limits.maxTabSwitches)
    || (limits.maxFullscreenExits >= 0 && attempt.antiCheat.fullscreenExits > limits.maxFullscreenExits);
  attempt.antiCheat.flagged = attempt.antiCheat.flagged || exceeded;

  if (exceeded && limits.autoSubmitOnViolation) {
    attempt.antiCheat.terminatedReason = 'Anti-cheat limit exceeded';
    Object.assign(attempt, createSubmittedUpdate(test, attempt, { autoSubmitted: true, status: 'terminated' }));
  }

  await attempt.save();
  res.json({ success: true, data: { antiCheat: attempt.antiCheat, status: attempt.status } });
});

export const submitMockTest = asyncHandler(async (req, res) => {
  const attemptId = req.params.attemptId || req.body.attemptId;
  const test = await getPublishedTestForStudent(req.params.id);
  const attempt = attemptId
    ? await getAttemptOr404({ attemptId, studentId: req.student._id, testId: test._id })
    : await MockTestSubmission.findOne({ test: test._id, student: req.student._id, status: 'in_progress' }).sort({ attemptNumber: -1 });

  if (!attempt) {
    res.status(404);
    throw new Error('Active attempt not found');
  }
  ensureAttemptOpen(attempt);

  if (Array.isArray(req.body.answers)) {
    attempt.answers = normalizeAnswers(req.body.answers, test.questions);
  }

  Object.assign(attempt, createSubmittedUpdate(test, attempt, {
    autoSubmitted: Boolean(req.body.autoSubmitted || remainingSeconds(attempt) <= 0),
    status: remainingSeconds(attempt) <= 0 ? 'auto_submitted' : undefined,
  }));
  await attempt.save();
  await recalculateReadinessScore(req.student);

  res.json({ success: true, data: attempt });
});

export const getMyMockResults = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = { student: req.student._id, status: { $ne: 'in_progress' } };
  const [results, total] = await Promise.all([
    MockTestSubmission.find(query).populate('test', 'title durationMinutes showReview').sort({ submittedAt: -1 }).skip(skip).limit(limit),
    MockTestSubmission.countDocuments(query),
  ]);
  res.json({ success: true, data: results, meta: buildPaginationMeta({ page, limit, total }) });
});

export const getMockAttemptReview = asyncHandler(async (req, res) => {
  const attempt = await getAttemptOr404({ attemptId: req.params.attemptId, studentId: req.student._id });
  const test = await MockTest.findById(attempt.test);
  if (!test.showReview) {
    res.status(403);
    throw new Error('Review is disabled for this test');
  }
  res.json({ success: true, data: { attempt, test: { title: test.title }, questions: buildReview(test, attempt) } });
});

export const getMyMockAnalytics = asyncHandler(async (req, res) => {
  const results = await MockTestSubmission.find({ student: req.student._id, status: { $ne: 'in_progress' } })
    .populate('test', 'title')
    .sort({ submittedAt: 1 });

  const average = results.length
    ? Math.round(results.reduce((sum, result) => sum + result.percentage, 0) / results.length)
    : 0;

  const sectionTotals = new Map();
  results.forEach((result) => {
    result.sectionScores?.forEach((row) => {
      const current = sectionTotals.get(row.section) || { section: row.section, score: 0, totalMarks: 0 };
      current.score += row.score;
      current.totalMarks += row.totalMarks;
      sectionTotals.set(row.section, current);
    });
  });

  res.json({
    success: true,
    data: {
      attempts: results.length,
      average,
      best: results.reduce((max, result) => Math.max(max, result.percentage), 0),
      latest: results.at(-1)?.percentage || 0,
      weakSections: [...sectionTotals.values()]
        .map((row) => ({ ...row, percentage: row.totalMarks ? Math.round((row.score / row.totalMarks) * 100) : 0 }))
        .sort((a, b) => a.percentage - b.percentage)
        .slice(0, 5),
      trend: results.map((result) => ({
        attemptId: result._id,
        test: result.test?.title || 'Mock Test',
        percentage: result.percentage,
        submittedAt: result.submittedAt,
      })),
    },
  });
});

export const getMockLeaderboard = asyncHandler(async (req, res) => {
  const { limit } = getPagination(req.query);
  const rows = await MockTestSubmission.find({ test: req.params.id, status: { $ne: 'in_progress' } })
    .populate('student', 'fullName rollNumber department branch')
    .sort({ percentage: -1, score: -1, timeSpentSeconds: 1, submittedAt: 1 })
    .limit(limit);
  res.json({ success: true, data: rows });
});

export const getAdminMockAnalytics = asyncHandler(async (req, res) => {
  const match = { status: { $ne: 'in_progress' } };
  if (req.query.testId && mongoose.Types.ObjectId.isValid(req.query.testId)) {
    match.test = new mongoose.Types.ObjectId(req.query.testId);
  }

  const [summary] = await MockTestSubmission.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        attempts: { $sum: 1 },
        average: { $avg: '$percentage' },
        best: { $max: '$percentage' },
        flagged: { $sum: { $cond: ['$antiCheat.flagged', 1, 0] } },
      },
    },
  ]);

  const section = await MockTestSubmission.aggregate([
    { $match: match },
    { $unwind: '$sectionScores' },
    {
      $group: {
        _id: '$sectionScores.section',
        score: { $sum: '$sectionScores.score' },
        totalMarks: { $sum: '$sectionScores.totalMarks' },
        attempts: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const difficulty = await MockTestSubmission.aggregate([
    { $match: match },
    { $unwind: '$difficultyScores' },
    {
      $group: {
        _id: '$difficultyScores.difficulty',
        score: { $sum: '$difficultyScores.score' },
        totalMarks: { $sum: '$difficultyScores.totalMarks' },
        attempts: { $sum: 1 },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      attempts: summary?.attempts || 0,
      average: Math.round(summary?.average || 0),
      best: summary?.best || 0,
      flagged: summary?.flagged || 0,
      section: section.map((row) => ({ section: row._id, percentage: row.totalMarks ? Math.round((row.score / row.totalMarks) * 100) : 0, attempts: row.attempts })),
      difficulty: difficulty.map((row) => ({ difficulty: row._id, percentage: row.totalMarks ? Math.round((row.score / row.totalMarks) * 100) : 0, attempts: row.attempts })),
    },
  });
});
