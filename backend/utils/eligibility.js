export const checkEligibility = (student, drive) => {
  const reasons = [];
  const { eligibility, requiredSkills = [] } = drive;
  const maxBacklogs = eligibility.maximumBacklogs ?? eligibility.maxBacklogs ?? 0;

  if (student.cgpa < eligibility.minCgpa) {
    reasons.push(`CGPA ${student.cgpa} is below minimum ${eligibility.minCgpa}`);
  }

  if (eligibility.allowedBranches?.length && !eligibility.allowedBranches.includes(student.branch)) {
    reasons.push(`Branch ${student.branch} is not eligible`);
  }

  if (eligibility.allowedDepartments?.length && !eligibility.allowedDepartments.includes(student.department)) {
    reasons.push(`Department ${student.department || 'N/A'} is not eligible`);
  }

  if (eligibility.allowedSections?.length && !eligibility.allowedSections.includes(student.section)) {
    reasons.push(`Section ${student.section || 'N/A'} is not eligible`);
  }

  if (eligibility.allowedBatches?.length && !eligibility.allowedBatches.includes(student.batchYear)) {
    reasons.push(`Batch ${student.batchYear || 'N/A'} is not eligible`);
  }

  if (eligibility.genderRestrictions?.length && !eligibility.genderRestrictions.includes(student.gender)) {
    reasons.push(`Gender restriction does not match this student profile`);
  }

  if ((student.activeBacklogs ?? student.backlogs ?? 0) > maxBacklogs) {
    reasons.push(`Active backlogs ${student.activeBacklogs ?? student.backlogs} exceed maximum ${maxBacklogs}`);
  }

  if ((student.tenthPercentage || 0) < (eligibility.minimumTenthPercentage || 0)) {
    reasons.push(`10th percentage is below minimum ${eligibility.minimumTenthPercentage}`);
  }

  if ((student.twelfthPercentage || student.diplomaPercentage || 0) < (eligibility.minimumTwelfthPercentage || 0)) {
    reasons.push(`12th/diploma percentage is below minimum ${eligibility.minimumTwelfthPercentage}`);
  }

  if ((student.graduationPercentage || 0) < (eligibility.minimumGraduationPercentage || 0)) {
    reasons.push(`Graduation percentage is below minimum ${eligibility.minimumGraduationPercentage}`);
  }

  if ((student.atsScore || 0) < (eligibility.minimumATSScore || 0)) {
    reasons.push(`ATS score is below minimum ${eligibility.minimumATSScore}`);
  }

  if (student.placementBlocked) {
    reasons.push('Student is blocked from future placement applications');
  }

  if (student.placementConsentStatus === 'not_interested' || student.placementConsentStatus === 'higher_studies') {
    reasons.push(`Placement consent status is ${student.placementConsentStatus}`);
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
