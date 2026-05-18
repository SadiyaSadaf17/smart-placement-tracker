export const checkEligibility = (student, drive) => {
  const reasons = [];
  const { eligibility, requiredSkills = [] } = drive;

  if (student.cgpa < eligibility.minCgpa) {
    reasons.push(`CGPA ${student.cgpa} is below minimum ${eligibility.minCgpa}`);
  }

  if (!eligibility.allowedBranches.includes(student.branch)) {
    reasons.push(`Branch ${student.branch} is not eligible`);
  }

  if (student.backlogs > eligibility.maxBacklogs) {
    reasons.push(`Backlogs ${student.backlogs} exceed maximum ${eligibility.maxBacklogs}`);
  }

  const studentSkills = (student.skills || []).map((s) => s.toLowerCase());
  const missingSkills = requiredSkills.filter(
    (skill) => !studentSkills.includes(skill.toLowerCase())
  );

  if (missingSkills.length > 0 && requiredSkills.length > 0) {
    reasons.push(`Missing skills: ${missingSkills.join(', ')}`);
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    skillMatch:
      requiredSkills.length === 0
        ? 100
        : Math.round(
            ((requiredSkills.length - missingSkills.length) / requiredSkills.length) * 100
          ),
  };
};
