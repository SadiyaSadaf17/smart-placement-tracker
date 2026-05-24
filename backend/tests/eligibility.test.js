import test from 'node:test';
import assert from 'node:assert/strict';
import { checkEligibility } from '../utils/eligibility.js';

test('eligibility reports reasons for academic and backlog failures', () => {
  const student = {
    cgpa: 5.8,
    branch: 'CSE',
    department: 'CSE',
    activeBacklogs: 2,
    tenthPercentage: 70,
    twelfthPercentage: 60,
    graduationPercentage: 65,
    atsScore: 40,
    skills: ['React'],
  };
  const drive = {
    eligibility: {
      minCgpa: 7,
      allowedBranches: ['CSE'],
      maximumBacklogs: 0,
      minimumTenthPercentage: 75,
      minimumTwelfthPercentage: 70,
      minimumGraduationPercentage: 70,
      minimumATSScore: 60,
    },
    requiredSkills: ['React', 'Node.js'],
  };

  const result = checkEligibility(student, drive);
  assert.equal(result.eligible, false);
  assert.ok(result.reasons.length >= 5);
  assert.equal(result.skillMatch, 50);
});
