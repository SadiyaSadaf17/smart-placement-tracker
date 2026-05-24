import crypto from 'crypto';
import XLSX from 'xlsx';
import Student from '../models/Student.js';
import PlacementDrive from '../models/PlacementDrive.js';
import EligibilitySnapshot from '../models/EligibilitySnapshot.js';
import { checkEligibility } from '../utils/eligibility.js';
import { notifyMany } from './notificationService.js';

const versionForDrive = (drive) =>
  crypto
    .createHash('sha1')
    .update(JSON.stringify({
      eligibility: drive.eligibility,
      requiredSkills: drive.requiredSkills,
      updatedAt: drive.updatedAt,
    }))
    .digest('hex');

const buildDepartmentStats = (rows) => {
  const stats = new Map();
  rows.forEach((row) => {
    const key = row.department || row.branch || 'Unassigned';
    const current = stats.get(key) || { department: key, eligible: 0, ineligible: 0, total: 0 };
    current.total += 1;
    if (row.eligible) current.eligible += 1;
    else current.ineligible += 1;
    stats.set(key, current);
  });
  return [...stats.values()].sort((a, b) => b.eligible - a.eligible);
};

export const evaluateDriveEligibility = async (driveOrId, { force = false } = {}) => {
  const drive = typeof driveOrId === 'string' ? await PlacementDrive.findById(driveOrId) : driveOrId;
  if (!drive) {
    const error = new Error('Drive not found');
    error.statusCode = 404;
    throw error;
  }

  const driveVersion = versionForDrive(drive);
  const cached = await EligibilitySnapshot.findOne({ drive: drive._id });
  if (!force && cached?.driveVersion === driveVersion) return cached;

  const students = await Student.find()
    .populate('user', 'email isActive')
    .select('fullName rollNumber department section batchYear branch skills cgpa backlogs activeBacklogs tenthPercentage twelfthPercentage diplomaPercentage graduationPercentage atsScore gender placementBlocked placementConsentStatus user');

  const rows = students
    .filter((student) => student.user?.isActive)
    .map((student) => {
      const eligibility = checkEligibility(student, drive);
      return {
        student: student._id,
        fullName: student.fullName,
        rollNumber: student.rollNumber,
        department: student.department,
        section: student.section,
        batchYear: student.batchYear,
        branch: student.branch,
        eligible: eligibility.eligible,
        reasons: eligibility.reasons,
        skillMatch: eligibility.skillMatch,
      };
    });

  const payload = {
    drive: drive._id,
    driveVersion,
    eligibleCount: rows.filter((row) => row.eligible).length,
    ineligibleCount: rows.filter((row) => !row.eligible).length,
    departmentStats: buildDepartmentStats(rows),
    students: rows,
    calculatedAt: new Date(),
  };

  return EligibilitySnapshot.findOneAndUpdate({ drive: drive._id }, payload, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });
};

export const getFilteredEligibilityRows = (snapshot, filters = {}) => {
  const { department, section, batchYear, eligible } = filters;
  return (snapshot.students || []).filter((row) => {
    if (department && row.department !== department) return false;
    if (section && row.section !== section) return false;
    if (batchYear && row.batchYear !== batchYear) return false;
    if (eligible !== undefined && String(row.eligible) !== String(eligible)) return false;
    return true;
  });
};

export const notifyEligibleStudents = async (driveId) => {
  const [drive, snapshot] = await Promise.all([
    PlacementDrive.findById(driveId),
    evaluateDriveEligibility(driveId),
  ]);
  const eligibleIds = snapshot.students.filter((row) => row.eligible).map((row) => row.student);
  const students = await Student.find({ _id: { $in: eligibleIds } }).select('user');

  await notifyMany(
    students.map((student) => student.user),
    {
      title: 'You are eligible for a placement drive',
      message: `${drive.companyName} is hiring for ${drive.role}.`,
      type: 'drive',
      link: '/student/companies',
    }
  );

  return { notified: students.length };
};

export const buildEligibilityWorkbook = (rows) => {
  const data = rows.map((row) => ({
    Name: row.fullName,
    Roll: row.rollNumber,
    Department: row.department,
    Section: row.section,
    Batch: row.batchYear,
    Branch: row.branch,
    Eligible: row.eligible ? 'Yes' : 'No',
    Reasons: row.reasons?.join('; ') || '',
    SkillMatch: row.skillMatch,
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Eligibility');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};
