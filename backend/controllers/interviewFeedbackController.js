import InterviewFeedback from '../models/InterviewFeedback.js';
import Student from '../models/Student.js';
import asyncHandler from '../utils/asyncHandler.js';
import { logAudit } from '../services/auditService.js';
import { recalculateReadinessScore } from '../services/readinessScoreService.js';

export const createInterviewFeedback = asyncHandler(async (req, res) => {
  const scores = ['communicationScore', 'technicalScore', 'hrScore', 'confidenceScore'].map((key) => Number(req.body[key] || 0));
  const overallScore = Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10;
  const feedback = await InterviewFeedback.create({ ...req.body, overallScore, evaluatedBy: req.user._id });
  const student = await Student.findById(feedback.student);
  if (student) await recalculateReadinessScore(student);
  await logAudit({ actor: req.user, actionType: 'INTERVIEW_FEEDBACK_CREATED', targetEntity: 'InterviewFeedback', targetId: feedback._id, newValues: feedback.toObject(), ipAddress: req.ip });
  res.status(201).json({ success: true, data: feedback });
});

export const getFeedback = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === 'student') query.student = req.student._id;
  if (req.query.studentId) query.student = req.query.studentId;
  const feedback = await InterviewFeedback.find(query).populate('student', 'fullName rollNumber').populate('drive', 'companyName role').sort({ createdAt: -1 });
  res.json({ success: true, data: feedback });
});

export const getFeedbackAnalytics = asyncHandler(async (req, res) => {
  const match = {};
  if (req.user.role === 'student') match.student = req.student._id;
  if (req.query.studentId) match.student = req.query.studentId;

  const [analytics] = await InterviewFeedback.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        avgCommunication: { $avg: '$communicationScore' },
        avgTechnical: { $avg: '$technicalScore' },
        avgHr: { $avg: '$hrScore' },
        avgConfidence: { $avg: '$confidenceScore' },
        avgOverall: { $avg: '$overallScore' },
      },
    },
  ]);

  res.json({
    success: true,
    data: analytics || {
      count: 0,
      avgCommunication: 0,
      avgTechnical: 0,
      avgHr: 0,
      avgConfidence: 0,
      avgOverall: 0,
    },
  });
});
