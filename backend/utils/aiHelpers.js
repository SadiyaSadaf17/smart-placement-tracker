// Lightweight AI-style helpers (no external API required)

export const calculateATSScore = (student) => {
  let score = 40;
  if (student.resume) score += 25;
  if (student.skills?.length >= 5) score += 15;
  else if (student.skills?.length >= 3) score += 10;
  if (student.projects?.length >= 2) score += 10;
  if (student.certifications?.length >= 1) score += 5;
  if (student.linkedin) score += 2.5;
  if (student.github) score += 2.5;
  if (student.cgpa >= 8) score += 5;
  else if (student.cgpa >= 7) score += 3;
  return Math.min(100, Math.round(score));
};

export const skillGapAnalysis = (student, drive) => {
  const studentSkills = (student.skills || []).map((s) => s.toLowerCase());
  const required = drive.requiredSkills || [];
  const matched = required.filter((s) => studentSkills.includes(s.toLowerCase()));
  const missing = required.filter((s) => !studentSkills.includes(s.toLowerCase()));
  const recommended = missing.slice(0, 5).map((skill) => ({
    skill,
    resources: [`Learn ${skill} on freeCodeCamp`, `Practice ${skill} projects`],
  }));

  return {
    matchPercentage: required.length ? Math.round((matched.length / required.length) * 100) : 100,
    matched,
    missing,
    recommended,
  };
};

export const recommendDrives = (student, drives) => {
  return drives
    .map((drive) => {
      const studentSkills = (student.skills || []).map((s) => s.toLowerCase());
      const required = drive.requiredSkills || [];
      const overlap = required.filter((s) => studentSkills.includes(s.toLowerCase())).length;
      const cgpaFit = student.cgpa >= (drive.eligibility?.minCgpa || 0) ? 1 : 0;
      const branchFit = (drive.eligibility?.allowedBranches || []).includes(student.branch) ? 1 : 0;
      const score = overlap * 10 + cgpaFit * 30 + branchFit * 40;
      return { drive, score, overlap };
    })
    .filter((r) => r.score > 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};

export const placementPrediction = (student) => {
  let probability = 30;
  if (student.cgpa >= 8.5) probability += 25;
  else if (student.cgpa >= 7.5) probability += 15;
  else if (student.cgpa >= 6.5) probability += 8;
  if (student.backlogs === 0) probability += 15;
  if ((student.skills || []).length >= 8) probability += 15;
  else if ((student.skills || []).length >= 5) probability += 10;
  if ((student.projects || []).length >= 2) probability += 10;
  if (student.resume) probability += 5;
  return {
    probability: Math.min(95, probability),
    factors: ['CGPA', 'Skills', 'Projects', 'Backlogs', 'Resume completeness'],
  };
};
