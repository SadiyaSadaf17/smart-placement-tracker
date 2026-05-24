import crypto from 'crypto';
import Application from '../models/Application.js';
import ReadinessScore from '../models/ReadinessScore.js';
import ScoreHistory from '../models/ScoreHistory.js';
import {
  READINESS_SCORE_TARGETS,
  READINESS_SCORE_THRESHOLDS,
  READINESS_SCORE_WEIGHTS,
} from '../config/readinessScore.js';

const METRIC_LABELS = Object.freeze({
  atsResume: 'ATS Resume Score',
  skills: 'Skills',
  cgpa: 'CGPA',
  applications: 'Applications',
  mockTests: 'Mock Tests',
  interviews: 'Interviews',
  profileCompletion: 'Profile Completion',
});

const roundNames = {
  aptitude: ['Aptitude'],
  interviews: ['Technical Round', 'HR Round', 'Selected'],
};

const clamp = (value, min = 0, max = 100) => Math.min(Math.max(Number(value) || 0, min), max);
const round = (value) => Math.round((Number(value) || 0) * 100) / 100;
const normalize = (value, max) => clamp((Number(value) / max) * 100);

const hashPayload = (payload) =>
  crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');

const getGrade = (score) => {
  if (score >= 85) return 'Highly Ready';
  if (score >= 70) return 'Ready';
  if (score >= 50) return 'Developing';
  return 'Needs Work';
};

const getArrayAverage = (items, keys = ['score', 'percentage', 'marks']) => {
  if (!Array.isArray(items) || items.length === 0) return 0;

  const values = items
    .map((item) => keys.map((key) => Number(item?.[key])).find((value) => Number.isFinite(value)))
    .filter((value) => Number.isFinite(value));

  if (!values.length) return 0;
  return clamp(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const calculateProfileCompletion = (student) => {
  const checks = [
    student.fullName,
    student.phone,
    student.rollNumber,
    student.branch,
    Number.isFinite(Number(student.cgpa)),
    student.resume,
    student.linkedin,
    student.github,
    (student.skills || []).length >= 3,
    (student.projects || []).length > 0,
    (student.certifications || []).length > 0,
  ];

  return round((checks.filter(Boolean).length / checks.length) * 100);
};

const calculateInterviewPerformance = (applications) => {
  const interviewRounds = applications.flatMap((application) =>
    (application.roundHistory || []).filter((entry) =>
      roundNames.interviews.includes(entry.round)
    )
  );

  if (!interviewRounds.length) return 0;

  const passed = interviewRounds.filter((entry) =>
    entry.status === 'passed' || entry.round === 'Selected'
  ).length;

  return round((passed / interviewRounds.length) * 100);
};

const calculateMockTestPerformance = (student, applications) => {
  const explicitAverage = getArrayAverage(student.mockTests || student.mockTestResults);
  if (explicitAverage) return explicitAverage;

  const aptitudeRounds = applications.flatMap((application) =>
    (application.roundHistory || []).filter((entry) => roundNames.aptitude.includes(entry.round))
  );

  if (!aptitudeRounds.length) return 0;
  const passed = aptitudeRounds.filter((entry) => entry.status === 'passed').length;
  return round((passed / aptitudeRounds.length) * 100);
};

const buildMetric = ({ key, raw, weight, value, maxValue }) => ({
  label: METRIC_LABELS[key],
  raw: round(clamp(raw)),
  weighted: round(clamp(raw) * weight),
  weight,
  value,
  maxValue,
});

const buildBreakdown = ({ student, applications }) => {
  const skillsCount = student.skills?.length || 0;
  const applicationCount = applications.length;
  const mockScore = calculateMockTestPerformance(student, applications);
  const interviewScore = calculateInterviewPerformance(applications);

  return {
    atsResume: buildMetric({
      key: 'atsResume',
      raw: student.atsScore || 0,
      weight: READINESS_SCORE_WEIGHTS.atsResume,
      value: student.atsScore || 0,
      maxValue: 100,
    }),
    skills: buildMetric({
      key: 'skills',
      raw: normalize(skillsCount, READINESS_SCORE_TARGETS.skills),
      weight: READINESS_SCORE_WEIGHTS.skills,
      value: skillsCount,
      maxValue: READINESS_SCORE_TARGETS.skills,
    }),
    cgpa: buildMetric({
      key: 'cgpa',
      raw: normalize(student.cgpa || 0, 10),
      weight: READINESS_SCORE_WEIGHTS.cgpa,
      value: student.cgpa || 0,
      maxValue: 10,
    }),
    applications: buildMetric({
      key: 'applications',
      raw: normalize(applicationCount, READINESS_SCORE_TARGETS.applications),
      weight: READINESS_SCORE_WEIGHTS.applications,
      value: applicationCount,
      maxValue: READINESS_SCORE_TARGETS.applications,
    }),
    mockTests: buildMetric({
      key: 'mockTests',
      raw: mockScore,
      weight: READINESS_SCORE_WEIGHTS.mockTests,
      value: mockScore,
      maxValue: 100,
    }),
    interviews: buildMetric({
      key: 'interviews',
      raw: interviewScore,
      weight: READINESS_SCORE_WEIGHTS.interviews,
      value: interviewScore,
      maxValue: 100,
    }),
    profileCompletion: buildMetric({
      key: 'profileCompletion',
      raw: calculateProfileCompletion(student),
      weight: READINESS_SCORE_WEIGHTS.profileCompletion,
      value: calculateProfileCompletion(student),
      maxValue: 100,
    }),
  };
};

const getWeakAreas = (breakdown) =>
  Object.entries(breakdown)
    .filter(([, metric]) => metric.raw < READINESS_SCORE_THRESHOLDS.weakArea)
    .map(([key, metric]) => ({
      key,
      label: metric.label,
      score: metric.raw,
      severity: metric.raw < 35 ? 'high' : metric.raw < 50 ? 'medium' : 'low',
    }))
    .sort((a, b) => a.score - b.score);

const suggestionMap = {
  atsResume: {
    title: 'Optimize your resume for ATS screening',
    description: 'Upload a stronger resume with measurable projects, role keywords, clean formatting, and relevant technical skills.',
  },
  skills: {
    title: 'Expand your job-ready skill set',
    description: 'Add priority skills for your target roles and back them with projects or certifications.',
  },
  cgpa: {
    title: 'Strengthen academic eligibility',
    description: 'Focus on improving CGPA where possible and target drives whose eligibility criteria match your profile.',
  },
  applications: {
    title: 'Apply to more relevant drives',
    description: 'Increase consistent applications to eligible companies instead of waiting for a perfect opening.',
  },
  mockTests: {
    title: 'Practice aptitude and coding assessments',
    description: 'Attempt timed mock tests weekly and review weak topics after every attempt.',
  },
  interviews: {
    title: 'Improve interview conversion',
    description: 'Schedule mock interviews and prepare concise stories for projects, internships, strengths, and failures.',
  },
  profileCompletion: {
    title: 'Complete your student profile',
    description: 'Add contact details, links, resume, projects, skills, and certifications so recruiters see a complete profile.',
  },
};

const getSuggestions = (weakAreas) =>
  weakAreas.map((area) => ({
    key: area.key,
    title: suggestionMap[area.key].title,
    description: suggestionMap[area.key].description,
    priority: area.severity,
  }));

const getInsights = (score, breakdown, weakAreas) => {
  const strongest = Object.values(breakdown).sort((a, b) => b.raw - a.raw)[0];
  const insights = [
    `Overall readiness is ${getGrade(score).toLowerCase()} at ${round(score)} out of 100.`,
  ];

  if (strongest?.raw >= READINESS_SCORE_THRESHOLDS.strongArea) {
    insights.push(`${strongest.label} is currently your strongest placement signal.`);
  }

  if (weakAreas.length) {
    insights.push(`Focus first on ${weakAreas.slice(0, 2).map((area) => area.label).join(' and ')} for the fastest score lift.`);
  } else {
    insights.push('Your profile has balanced readiness across all measured categories.');
  }

  return insights;
};

const buildSourceSnapshot = ({ student, applications }) => ({
  atsScore: student.atsScore || 0,
  skills: [...(student.skills || [])].sort(),
  cgpa: student.cgpa || 0,
  resume: student.resume || '',
  profile: {
    phone: student.phone || '',
    linkedin: student.linkedin || '',
    github: student.github || '',
    projects: student.projects?.length || 0,
    certifications: student.certifications?.length || 0,
    updatedAt: student.updatedAt?.toISOString?.() || '',
  },
  applications: applications.map((application) => ({
    id: application._id.toString(),
    round: application.currentRound,
    history: (application.roundHistory || []).map((entry) => ({
      round: entry.round,
      status: entry.status,
    })),
  })),
});

export const calculateReadinessPayload = async (student) => {
  const applications = await Application.find({ student: student._id }).select(
    'currentRound roundHistory createdAt updatedAt'
  );
  const breakdown = buildBreakdown({ student, applications });
  const score = round(Object.values(breakdown).reduce((sum, metric) => sum + metric.weighted, 0));
  const weakAreas = getWeakAreas(breakdown);
  const sourceSnapshot = buildSourceSnapshot({ student, applications });

  return {
    student: student._id,
    score,
    grade: getGrade(score),
    breakdown,
    weakAreas,
    suggestions: getSuggestions(weakAreas),
    insights: getInsights(score, breakdown, weakAreas),
    sourceHash: hashPayload(sourceSnapshot),
    calculatedAt: new Date(),
  };
};

export const recalculateReadinessScore = async (student, options = {}) => {
  if (!student?._id) return null;

  const payload = await calculateReadinessPayload(student);
  const existing = await ReadinessScore.findOne({ student: student._id });

  if (!options.force && existing?.sourceHash === payload.sourceHash) {
    return existing;
  }

  const previousScore = existing?.score;
  const saved = await ReadinessScore.findOneAndUpdate(
    { student: student._id },
    payload,
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );

  const delta = round(payload.score - (previousScore ?? payload.score));
  const shouldWriteHistory =
    options.force ||
    previousScore === undefined ||
    Math.abs(delta) >= READINESS_SCORE_THRESHOLDS.historyDelta;

  if (shouldWriteHistory) {
    await ScoreHistory.create({
      student: student._id,
      score: payload.score,
      previousScore,
      delta,
      breakdown: payload.breakdown,
      weakAreas: payload.weakAreas,
      suggestions: payload.suggestions,
      sourceHash: payload.sourceHash,
      calculatedAt: payload.calculatedAt,
    });
  }

  return saved;
};

export const getOrCreateReadinessScore = async (student) => {
  const existing = await ReadinessScore.findOne({ student: student._id });
  if (existing) return existing;
  return recalculateReadinessScore(student, { force: true });
};

export const getReadinessAnalytics = async (studentId) => {
  const history = await ScoreHistory.find({ student: studentId })
    .sort({ calculatedAt: 1 })
    .limit(60);

  const latest = await ReadinessScore.findOne({ student: studentId });
  const first = history[0];
  const last = history[history.length - 1];

  return {
    latest,
    progress: history.map((entry) => ({
      date: entry.calculatedAt,
      score: entry.score,
      delta: entry.delta,
    })),
    summary: {
      totalSnapshots: history.length,
      firstScore: first?.score ?? latest?.score ?? 0,
      latestScore: latest?.score ?? last?.score ?? 0,
      netChange: round((latest?.score ?? last?.score ?? 0) - (first?.score ?? latest?.score ?? 0)),
      bestScore: history.reduce((max, entry) => Math.max(max, entry.score), latest?.score ?? 0),
    },
  };
};
