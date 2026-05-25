import MockTest from '../models/MockTest.js';
import MockTestSubmission from '../models/MockTestSubmission.js';
import asyncHandler from '../utils/asyncHandler.js';
import { logAudit } from '../services/auditService.js';
import { recalculateReadinessScore } from '../services/readinessScoreService.js';

const sanitizeStudentTest = (test) => {
  const payload = test.toObject();
  payload.questions = payload.questions.map(({ correctOption, ...question }) => question);
  return payload;
};

const scoreSubmission = (test, answers = []) => {
  const answerMap = new Map(answers.map((answer) => [String(answer.questionId), Number(answer.selectedOption)]));
  const totalMarks = test.questions.reduce((sum, question) => sum + question.marks, 0);
  const score = test.questions.reduce((sum, question) => (
    answerMap.get(String(question._id)) === question.correctOption ? sum + question.marks : sum
  ), 0);
  return { score, totalMarks, percentage: totalMarks ? Math.round((score / totalMarks) * 100) : 0 };
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

  const test = await MockTest.create({ ...req.body, createdBy: req.user._id });
  await logAudit({ actor: req.user, actionType: 'MOCK_TEST_CREATED', targetEntity: 'MockTest', targetId: test._id, newValues: test.toObject(), ipAddress: req.ip });
  res.status(201).json({ success: true, data: test });
});

export const getMockTests = asyncHandler(async (req, res) => {
  const query = req.user.role === 'student' ? { isPublished: true } : {};
  const tests = await MockTest.find(query).sort({ createdAt: -1 });
  res.json({
    success: true,
    data: req.user.role === 'student' ? tests.map(sanitizeStudentTest) : tests,
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

  const existingSubmission = req.user.role === 'student'
    ? await MockTestSubmission.findOne({ test: test._id, student: req.student?._id }).select('percentage submittedAt autoSubmitted')
    : null;

  res.json({
    success: true,
    data: req.user.role === 'student' ? sanitizeStudentTest(test) : test,
    submission: existingSubmission,
  });
});

export const submitMockTest = asyncHandler(async (req, res) => {
  const test = await MockTest.findById(req.params.id);
  if (!test || !test.isPublished) {
    res.status(404);
    throw new Error('Test not found');
  }

  const existingSubmission = await MockTestSubmission.findOne({ test: test._id, student: req.student._id });
  if (existingSubmission && !test.allowRetake) {
    res.status(409);
    throw new Error('This mock test has already been submitted');
  }

  if (!Array.isArray(req.body.answers)) {
    res.status(400);
    throw new Error('Answers must be submitted as an array');
  }

  const validQuestionIds = new Set(test.questions.map((question) => String(question._id)));
  const invalidAnswer = req.body.answers.find((answer) => {
    const question = test.questions.id(answer.questionId);
    return !validQuestionIds.has(String(answer.questionId))
      || !Number.isInteger(Number(answer.selectedOption))
      || Number(answer.selectedOption) < 0
      || Number(answer.selectedOption) >= question.options.length;
  });

  if (invalidAnswer) {
    res.status(400);
    throw new Error('One or more answers are invalid');
  }

  const result = scoreSubmission(test, req.body.answers || []);
  const submission = await MockTestSubmission.findOneAndUpdate(
    { test: test._id, student: req.student._id },
    { ...result, answers: req.body.answers || [], autoSubmitted: Boolean(req.body.autoSubmitted), submittedAt: new Date() },
    { new: true, upsert: true, runValidators: true }
  );
  await recalculateReadinessScore(req.student);
  res.json({ success: true, data: submission });
});

export const getMyMockResults = asyncHandler(async (req, res) => {
  const results = await MockTestSubmission.find({ student: req.student._id }).populate('test', 'title durationMinutes').sort({ createdAt: -1 });
  res.json({ success: true, data: results });
});

export const getMyMockAnalytics = asyncHandler(async (req, res) => {
  const results = await MockTestSubmission.find({ student: req.student._id })
    .populate('test', 'title')
    .sort({ submittedAt: 1 });

  const average = results.length
    ? Math.round(results.reduce((sum, result) => sum + result.percentage, 0) / results.length)
    : 0;

  res.json({
    success: true,
    data: {
      attempts: results.length,
      average,
      best: results.reduce((max, result) => Math.max(max, result.percentage), 0),
      latest: results.at(-1)?.percentage || 0,
      trend: results.map((result) => ({
        test: result.test?.title || 'Mock Test',
        percentage: result.percentage,
        submittedAt: result.submittedAt,
      })),
    },
  });
});
