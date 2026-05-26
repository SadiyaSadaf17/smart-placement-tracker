import PlacementDrive from '../models/PlacementDrive.js';
import Company from '../models/Company.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { checkEligibility } from '../utils/eligibility.js';
import { createNotification, notifyMany } from '../services/notificationService.js';
import { emitToAdmin } from '../config/socket.js';
import { logAudit } from '../services/auditService.js';
import {
  buildEligibilityWorkbook,
  evaluateDriveEligibility,
  getFilteredEligibilityRows,
  notifyEligibleStudents,
} from '../services/eligibilityService.js';
import { transitionDriveStage } from '../services/driveWorkflowService.js';
import { applyDriveScope } from '../utils/dataScope.js';
import { addSearch, buildPaginationMeta, getPagination } from '../utils/queryUtils.js';

export const createDrive = asyncHandler(async (req, res) => {
  const drive = await PlacementDrive.create({
    ...req.body,
    createdBy: req.admin?._id,
  });

  const students = await Student.find();
  const users = await User.find({
    _id: { $in: students.map((s) => s.user) },
    role: 'student',
    isActive: true,
  });

  await notifyMany(
    users.map((u) => u._id),
    {
      title: 'New Placement Drive',
      message: `${drive.companyName} is hiring for ${drive.role} - ${drive.package} LPA`,
      type: 'drive',
      link: '/student/companies',
    }
  );

  emitToAdmin('new-drive', drive);
  await logAudit({
    actor: req.user,
    actionType: 'DRIVE_CREATED',
    targetEntity: 'PlacementDrive',
    targetId: drive._id,
    newValues: drive.toObject(),
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, data: drive });
});

export const getDrives = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const { page, limit, skip } = getPagination(req.query);
  let query = {};

  if (status) query.driveStatus = status;
  query = addSearch(query, search, ['companyName', 'role']);
  if (req.user.role !== 'student') query = applyDriveScope(query, req);

  const total = await PlacementDrive.countDocuments(query);
  const drives = await PlacementDrive.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: drives,
    pagination: buildPaginationMeta({ page, limit, total }),
  });
});

export const getDriveById = asyncHandler(async (req, res) => {
  const query = req.user.role === 'student'
    ? { _id: req.params.id }
    : applyDriveScope({ _id: req.params.id }, req);
  const drive = await PlacementDrive.findOne(query);
  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }
  res.json({ success: true, data: drive });
});

export const updateDrive = asyncHandler(async (req, res) => {
  const scopedQuery = applyDriveScope({ _id: req.params.id }, req);
  const oldDrive = await PlacementDrive.findOne(scopedQuery).lean();
  if (!oldDrive) {
    res.status(404);
    throw new Error('Drive not found');
  }

  const drive = await PlacementDrive.findOneAndUpdate(scopedQuery, req.body, {
    new: true,
    runValidators: true,
  });
  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }
  await logAudit({
    actor: req.user,
    actionType: 'DRIVE_UPDATED',
    targetEntity: 'PlacementDrive',
    targetId: drive._id,
    oldValues: oldDrive,
    newValues: drive.toObject(),
    ipAddress: req.ip,
  });
  res.json({ success: true, data: drive });
});

export const deleteDrive = asyncHandler(async (req, res) => {
  const drive = await PlacementDrive.findOneAndDelete(applyDriveScope({ _id: req.params.id }, req));
  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }
  await logAudit({
    actor: req.user,
    actionType: 'DRIVE_DELETED',
    targetEntity: 'PlacementDrive',
    targetId: drive._id,
    oldValues: drive.toObject(),
    ipAddress: req.ip,
  });
  res.json({ success: true, message: 'Drive deleted' });
});

const evaluateStudentsForDrive = async (drive) => {
  const students = await Student.find().populate('user', 'email isActive');
  return students
    .filter((s) => s.user?.isActive)
    .map((s) => ({
      student: s,
      eligibility: checkEligibility(s, drive),
    }));
};

export const getEligibleStudents = asyncHandler(async (req, res) => {
  const drive = await PlacementDrive.findById(req.params.id);
  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }

  const snapshot = await evaluateDriveEligibility(drive);
  const eligible = snapshot.students.filter((row) => row.eligible);

  res.json({ success: true, data: eligible, count: eligible.length });
});

export const previewDriveEligibility = asyncHandler(async (req, res) => {
  const drive = req.params.id
    ? await PlacementDrive.findById(req.params.id)
    : new PlacementDrive(req.body);

  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }

  const snapshot = await evaluateDriveEligibility(drive, { force: req.query.force === 'true' });
  const rows = getFilteredEligibilityRows(snapshot, req.query);
  const eligible = rows.filter((row) => row.eligible);
  const ineligible = rows.filter((row) => !row.eligible);

  res.json({
    success: true,
    data: {
      eligibleCount: snapshot.eligibleCount,
      ineligibleCount: snapshot.ineligibleCount,
      total: snapshot.eligibleCount + snapshot.ineligibleCount,
      departmentStats: snapshot.departmentStats,
      calculatedAt: snapshot.calculatedAt,
      eligible,
      ineligible,
    },
  });
});

export const recalculateDriveEligibility = asyncHandler(async (req, res) => {
  const snapshot = await evaluateDriveEligibility(req.params.id, { force: true });
  res.json({ success: true, data: snapshot });
});

export const notifyDriveEligibleStudents = asyncHandler(async (req, res) => {
  const result = await notifyEligibleStudents(req.params.id);
  await logAudit({
    actor: req.user,
    actionType: 'DRIVE_ELIGIBLE_STUDENTS_NOTIFIED',
    targetEntity: 'PlacementDrive',
    targetId: req.params.id,
    newValues: result,
    ipAddress: req.ip,
  });
  res.json({ success: true, data: result });
});

export const downloadDriveEligibilityReport = asyncHandler(async (req, res) => {
  const snapshot = await evaluateDriveEligibility(req.params.id);
  const rows = getFilteredEligibilityRows(snapshot, req.query);
  const buffer = buildEligibilityWorkbook(rows);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=drive-eligibility-${req.params.id}.xlsx`);
  res.send(buffer);
});

export const transitionDriveWorkflowStage = asyncHandler(async (req, res) => {
  const oldDrive = await PlacementDrive.findById(req.params.id).lean();
  const drive = await transitionDriveStage({
    driveId: req.params.id,
    nextStage: req.body.nextStage,
    remarks: req.body.remarks,
    actor: req.user,
  });

  await logAudit({
    actor: req.user,
    actionType: 'DRIVE_STAGE_TRANSITIONED',
    targetEntity: 'PlacementDrive',
    targetId: drive._id,
    oldValues: { workflowStage: oldDrive?.workflowStage },
    newValues: { workflowStage: drive.workflowStage },
    ipAddress: req.ip,
  });

  res.json({ success: true, data: drive });
});
