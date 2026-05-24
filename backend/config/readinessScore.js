export const READINESS_SCORE_WEIGHTS = Object.freeze({
  atsResume: 0.25,
  skills: 0.15,
  cgpa: 0.15,
  applications: 0.1,
  mockTests: 0.15,
  interviews: 0.1,
  profileCompletion: 0.1,
});

export const READINESS_SCORE_TARGETS = Object.freeze({
  skills: 12,
  applications: 10,
  mockTests: 5,
});

export const READINESS_SCORE_THRESHOLDS = Object.freeze({
  weakArea: 60,
  strongArea: 80,
  historyDelta: 1,
});
