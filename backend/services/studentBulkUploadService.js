import bcrypt from 'bcryptjs';
import validator from 'validator';
import XLSX from 'xlsx';
import User from '../models/User.js';
import Student from '../models/Student.js';
import BulkUploadBatch from '../models/BulkUploadBatch.js';
import BulkUploadRow from '../models/BulkUploadRow.js';
import { BRANCHES } from '../utils/constants.js';

const HEADER_ALIASES = Object.freeze({
  email: ['email', 'email address', 'student email'],
  fullName: ['full name', 'fullname', 'name', 'student name'],
  phone: ['phone', 'mobile', 'contact', 'contact number'],
  personalEmail: ['personal email'],
  collegeEmail: ['college email', 'official email'],
  gender: ['gender'],
  dateOfBirth: ['date of birth', 'dob'],
  address: ['address'],
  rollNumber: ['roll number', 'roll no', 'roll', 'rollnumber', 'registration number'],
  batchYear: ['batch year', 'batch'],
  section: ['section'],
  branch: ['branch', 'department branch'],
  department: ['department', 'dept'],
  academicYear: ['academic year', 'year'],
  currentYear: ['current year'],
  graduationPercentage: ['graduation percentage', 'graduation %', 'degree percentage'],
  tenthPercentage: ['10th percentage', 'tenth percentage', 'ssc percentage'],
  twelfthPercentage: ['12th percentage', 'twelfth percentage', 'inter percentage'],
  diplomaPercentage: ['diploma percentage'],
  cgpa: ['cgpa', 'gpa'],
  skills: ['skills', 'skill set'],
  backlogs: ['backlogs', 'active backlogs'],
  activeBacklogs: ['active backlogs'],
  placementConsentStatus: ['placement consent', 'placement consent status'],
});

const REQUIRED_FIELDS = ['email', 'fullName', 'rollNumber', 'branch', 'cgpa'];
const MAX_PREVIEW_ROWS = 5000;

const normalizeHeader = (header) =>
  String(header || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

const canonicalFieldFor = (header) => {
  const normalized = normalizeHeader(header);
  return Object.entries(HEADER_ALIASES).find(([, aliases]) => aliases.includes(normalized))?.[0] || null;
};

const cleanString = (value) => String(value ?? '').trim();

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseSkills = (value) => {
  if (Array.isArray(value)) return value.map(cleanString).filter(Boolean);
  return cleanString(value)
    .split(',')
    .map(cleanString)
    .filter(Boolean);
};

const parseWorkbookRows = (file) => {
  const workbook = XLSX.read(file.buffer, { type: 'buffer', raw: false, cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: false });

  if (!rawRows.length) return [];
  const headers = rawRows[0].map(canonicalFieldFor);

  return rawRows.slice(1, MAX_PREVIEW_ROWS + 1).map((row, index) => {
    const data = {};
    headers.forEach((field, cellIndex) => {
      if (field) data[field] = row[cellIndex];
    });
    return { rowNumber: index + 2, data };
  });
};

const normalizeRow = (raw) => ({
  email: cleanString(raw.email).toLowerCase(),
  fullName: cleanString(raw.fullName),
  phone: cleanString(raw.phone),
  personalEmail: cleanString(raw.personalEmail).toLowerCase(),
  collegeEmail: cleanString(raw.collegeEmail).toLowerCase(),
  gender: cleanString(raw.gender).toLowerCase(),
  dateOfBirth: cleanString(raw.dateOfBirth),
  address: cleanString(raw.address),
  rollNumber: cleanString(raw.rollNumber).toUpperCase(),
  batchYear: cleanString(raw.batchYear),
  section: cleanString(raw.section).toUpperCase(),
  branch: cleanString(raw.branch).toUpperCase(),
  department: cleanString(raw.department),
  academicYear: toNumber(raw.academicYear),
  currentYear: toNumber(raw.currentYear),
  cgpa: toNumber(raw.cgpa),
  graduationPercentage: toNumber(raw.graduationPercentage),
  tenthPercentage: toNumber(raw.tenthPercentage),
  twelfthPercentage: toNumber(raw.twelfthPercentage),
  diplomaPercentage: toNumber(raw.diplomaPercentage),
  skills: parseSkills(raw.skills),
  backlogs: toNumber(raw.backlogs) ?? toNumber(raw.activeBacklogs) ?? 0,
  activeBacklogs: toNumber(raw.activeBacklogs) ?? toNumber(raw.backlogs) ?? 0,
  placementConsentStatus: cleanString(raw.placementConsentStatus) || 'pending',
});

const requiredErrors = (data) =>
  REQUIRED_FIELDS.flatMap((field) =>
    data[field] === undefined || data[field] === null || data[field] === ''
      ? [{ field, type: 'required', message: `${field} is required` }]
      : []
  );

const validateRowShape = (data) => {
  const errors = requiredErrors(data);

  if (data.email && !validator.isEmail(data.email)) {
    errors.push({ field: 'email', type: 'format', message: 'Email must be valid' });
  }
  if (data.personalEmail && !validator.isEmail(data.personalEmail)) {
    errors.push({ field: 'personalEmail', type: 'format', message: 'Personal email must be valid' });
  }
  if (data.collegeEmail && !validator.isEmail(data.collegeEmail)) {
    errors.push({ field: 'collegeEmail', type: 'format', message: 'College email must be valid' });
  }
  if (data.rollNumber && !/^[A-Z0-9/-]{3,30}$/.test(data.rollNumber)) {
    errors.push({ field: 'rollNumber', type: 'format', message: 'Roll number must be 3-30 letters, numbers, /, or -' });
  }
  if (data.branch && !BRANCHES.includes(data.branch)) {
    errors.push({ field: 'branch', type: 'enum', message: `Branch must be one of ${BRANCHES.join(', ')}` });
  }
  if (!Number.isFinite(data.cgpa) || data.cgpa < 0 || data.cgpa > 10) {
    errors.push({ field: 'cgpa', type: 'range', message: 'CGPA must be between 0 and 10' });
  }
  if (!Number.isFinite(data.backlogs) || data.backlogs < 0) {
    errors.push({ field: 'backlogs', type: 'range', message: 'Backlogs must be 0 or higher' });
  }
  if (data.academicYear !== undefined && (!Number.isInteger(data.academicYear) || data.academicYear < 1 || data.academicYear > 6)) {
    errors.push({ field: 'academicYear', type: 'range', message: 'Academic year must be between 1 and 6' });
  }
  if (data.currentYear !== undefined && (!Number.isInteger(data.currentYear) || data.currentYear < 1 || data.currentYear > 6)) {
    errors.push({ field: 'currentYear', type: 'range', message: 'Current year must be between 1 and 6' });
  }

  return errors;
};

const applyDuplicateErrors = async (rows) => {
  const emails = rows.map((row) => row.data.email).filter(Boolean);
  const rolls = rows.map((row) => row.data.rollNumber).filter(Boolean);

  const [existingUsers, existingStudents] = await Promise.all([
    User.find({ email: { $in: emails } }).select('email').lean(),
    Student.find({ $or: [{ rollNumber: { $in: rolls } }, { collegeEmail: { $in: rows.map((row) => row.data.collegeEmail).filter(Boolean) } }] }).select('rollNumber collegeEmail').lean(),
  ]);

  const existingEmails = new Set(existingUsers.map((user) => user.email));
  const existingRolls = new Set(existingStudents.map((student) => student.rollNumber));
  const existingCollegeEmails = new Set(existingStudents.map((student) => student.collegeEmail).filter(Boolean));
  const seenEmails = new Set();
  const seenRolls = new Set();

  return rows.map((row) => {
    const errors = [...row.errors];
    const email = row.data.email;
    const rollNumber = row.data.rollNumber;

    if (email && seenEmails.has(email)) {
      errors.push({ field: 'email', type: 'duplicate_file', message: 'Email is duplicated in this file' });
    }
    if (rollNumber && seenRolls.has(rollNumber)) {
      errors.push({ field: 'rollNumber', type: 'duplicate_file', message: 'Roll number is duplicated in this file' });
    }
    if (email && existingEmails.has(email)) {
      errors.push({ field: 'email', type: 'duplicate_database', message: 'Email already exists' });
    }
    if (rollNumber && existingRolls.has(rollNumber)) {
      errors.push({ field: 'rollNumber', type: 'duplicate_database', message: 'Roll number already exists' });
    }
    if (row.data.collegeEmail && existingCollegeEmails.has(row.data.collegeEmail)) {
      errors.push({ field: 'collegeEmail', type: 'duplicate_database', message: 'College email already exists' });
    }

    if (email) seenEmails.add(email);
    if (rollNumber) seenRolls.add(rollNumber);

    const hasDuplicate = errors.some((error) => error.type.startsWith('duplicate'));
    return {
      ...row,
      errors,
      status: errors.length ? (hasDuplicate ? 'duplicate' : 'invalid') : 'valid',
    };
  });
};

const summarizeRows = (rows) => ({
  totalRows: rows.length,
  validRows: rows.filter((row) => row.status === 'valid').length,
  invalidRows: rows.filter((row) => row.status === 'invalid').length,
  duplicateRows: rows.filter((row) => row.status === 'duplicate').length,
});

export const createStudentBulkPreview = async ({ file, uploadedBy }) => {
  const parsedRows = parseWorkbookRows(file);
  const shapedRows = parsedRows.map(({ rowNumber, data }) => {
    const normalized = normalizeRow(data);
    const errors = validateRowShape(normalized);
    return {
      rowNumber,
      data: normalized,
      errors,
      status: errors.length ? 'invalid' : 'valid',
    };
  });

  const rows = await applyDuplicateErrors(shapedRows);
  const batch = await BulkUploadBatch.create({
    uploadedBy,
    fileName: file.originalname,
    summary: summarizeRows(rows),
  });

  if (rows.length) {
    await BulkUploadRow.insertMany(
      rows.map((row) => ({
        ...row,
        batch: batch._id,
        expiresAt: batch.expiresAt,
      })),
      { ordered: false }
    );
  }

  return batch;
};

const DEFAULT_BULK_STUDENT_PASSWORD = 'student123';

export const commitStudentBulkUpload = async ({ batchId, uploadedBy }) => {
  const batch = await BulkUploadBatch.findOne({ _id: batchId, uploadedBy });
  if (!batch) {
    const error = new Error('Bulk upload batch not found');
    error.statusCode = 404;
    throw error;
  }
  if (batch.status === 'committed') {
    const error = new Error('Bulk upload batch has already been committed');
    error.statusCode = 400;
    throw error;
  }

  const validRows = await BulkUploadRow.find({ batch: batch._id, status: 'valid' }).sort({ rowNumber: 1 });
  if (!validRows.length) {
    const error = new Error('No valid rows available to import');
    error.statusCode = 400;
    throw error;
  }

  const credentials = validRows.map((row) => ({
    row,
    temporaryPassword: DEFAULT_BULK_STUDENT_PASSWORD,
  }));

  const userDocs = await Promise.all(
    credentials.map(async ({ row, temporaryPassword }) => ({
      email: row.data.email,
      password: await bcrypt.hash(temporaryPassword, 12),
      role: 'student',
      isActive: true,
      mustChangePassword: true,
    }))
  );

  let insertedUsers = [];
  try {
    insertedUsers = await User.insertMany(userDocs, { ordered: false });
    const userByEmail = new Map(insertedUsers.map((user) => [user.email, user._id]));

    const students = credentials.map(({ row }) => ({
      user: userByEmail.get(row.data.email),
      fullName: row.data.fullName,
      phone: row.data.phone,
      personalEmail: row.data.personalEmail,
      collegeEmail: row.data.collegeEmail,
      gender: row.data.gender || undefined,
      dateOfBirth: row.data.dateOfBirth ? new Date(row.data.dateOfBirth) : undefined,
      address: row.data.address,
      rollNumber: row.data.rollNumber,
      batchYear: row.data.batchYear,
      section: row.data.section,
      branch: row.data.branch,
      department: row.data.department || row.data.branch,
      academicYear: row.data.academicYear,
      currentYear: row.data.currentYear || row.data.academicYear,
      cgpa: row.data.cgpa,
      graduationPercentage: row.data.graduationPercentage,
      tenthPercentage: row.data.tenthPercentage,
      twelfthPercentage: row.data.twelfthPercentage,
      diplomaPercentage: row.data.diplomaPercentage,
      skills: row.data.skills,
      backlogs: row.data.backlogs,
      activeBacklogs: row.data.activeBacklogs,
      placementConsentStatus: row.data.placementConsentStatus,
    }));

    const insertedStudents = await Student.insertMany(students, { ordered: false });
    const safeCredentials = credentials.map(({ row, temporaryPassword }) => ({
      email: row.data.email,
      rollNumber: row.data.rollNumber,
      fullName: row.data.fullName,
      temporaryPassword,
    }));

    batch.status = 'committed';
    batch.credentials = safeCredentials;
    await batch.save();

    return {
      imported: insertedStudents.length,
      skipped: batch.summary.totalRows - insertedStudents.length,
      credentials: safeCredentials,
      summary: batch.summary,
    };
  } catch (error) {
    const insertedIds = insertedUsers.map((user) => user._id);
    if (insertedIds.length) await User.deleteMany({ _id: { $in: insertedIds } });
    batch.status = 'failed';
    await batch.save();
    throw error;
  }
};

export const buildBulkErrorRows = async (batch) => {
  const rows = await BulkUploadRow.find({
    batch: batch._id,
    status: { $in: ['invalid', 'duplicate'] },
  }).sort({ rowNumber: 1 });

  return rows.flatMap((row) =>
    row.errors.map((error) => ({
      Row: row.rowNumber,
      Email: row.data.email,
      RollNumber: row.data.rollNumber,
      Field: error.field,
      Type: error.type,
      Message: error.message,
    }))
  );
};
