import PlacementDrive from '../models/PlacementDrive.js';
import Company from '../models/Company.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { checkEligibility } from '../utils/eligibility.js';
import { createNotification, notifyMany } from '../services/notificationService.js';
import { emitToAdmin } from '../config/socket.js';

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

  res.status(201).json({ success: true, data: drive });
});

export const getDrives = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 10 } = req.query;
  const query = {};

  if (status) query.driveStatus = status;
  if (search) {
    query.$or = [
      { companyName: { $regex: search, $options: 'i' } },
      { role: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await PlacementDrive.countDocuments(query);
  const drives = await PlacementDrive.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    success: true,
    data: drives,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
});

export const getDriveById = asyncHandler(async (req, res) => {
  const drive = await PlacementDrive.findById(req.params.id);
  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }
  res.json({ success: true, data: drive });
});

export const updateDrive = asyncHandler(async (req, res) => {
  const drive = await PlacementDrive.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }
  res.json({ success: true, data: drive });
});

export const deleteDrive = asyncHandler(async (req, res) => {
  const drive = await PlacementDrive.findByIdAndDelete(req.params.id);
  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }
  res.json({ success: true, message: 'Drive deleted' });
});

export const getEligibleStudents = asyncHandler(async (req, res) => {
  const drive = await PlacementDrive.findById(req.params.id);
  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }

  const students = await Student.find().populate('user', 'email isActive');
  const eligible = students
    .filter((s) => s.user?.isActive)
    .map((s) => ({
      student: s,
      eligibility: checkEligibility(s, drive),
    }))
    .filter((e) => e.eligibility.eligible);

  res.json({ success: true, data: eligible, count: eligible.length });
});
