import Student from '../models/Student.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { notifyMany } from '../services/notificationService.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalStudents = await Student.countDocuments();
  const placedStudents = await Student.countDocuments({ placementStatus: 'placed' });
  const activeDrives = await PlacementDrive.countDocuments({
    driveStatus: { $in: ['upcoming', 'active'] },
  });

  const placedData = await Student.find({ placementStatus: 'placed', placedPackage: { $gt: 0 } });
  const packages = placedData.map((s) => s.placedPackage).filter(Boolean);
  const highestPackage = packages.length ? Math.max(...packages) : 0;
  const averagePackage = packages.length
    ? (packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(2)
    : 0;

  const branchWise = await Student.aggregate([
    {
      $group: {
        _id: '$branch',
        total: { $sum: 1 },
        placed: {
          $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        branch: '$_id',
        total: 1,
        placed: 1,
        percentage: {
          $cond: [
            { $gt: ['$total', 0] },
            { $multiply: [{ $divide: ['$placed', '$total'] }, 100] },
            0,
          ],
        },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      totalStudents,
      totalPlacements: placedStudents,
      placementPercentage: totalStudents
        ? ((placedStudents / totalStudents) * 100).toFixed(1)
        : 0,
      highestPackage,
      averagePackage,
      activeDrives,
      branchWise,
    },
  });
});

export const getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, branch, search, placementStatus } = req.query;
  const query = {};

  if (branch) query.branch = branch;
  if (placementStatus) query.placementStatus = placementStatus;
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Student.countDocuments(query);
  const students = await Student.find(query)
    .populate('user', 'email isActive')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    success: true,
    data: students,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const allowed = [
    'fullName', 'phone', 'branch', 'cgpa', 'skills', 'backlogs',
    'placementStatus', 'placedCompany', 'placedPackage',
  ];
  const updates = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });

  const student = await Student.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate('user', 'email');

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  res.json({ success: true, data: student });
});

export const deactivateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  await User.findByIdAndUpdate(student.user, { isActive: false });
  res.json({ success: true, message: 'Student deactivated' });
});

export const sendBulkNotification = asyncHandler(async (req, res) => {
  const { title, message, branch, type = 'info' } = req.body;
  const query = branch ? { branch } : {};
  const students = await Student.find(query);
  const users = await User.find({
    _id: { $in: students.map((s) => s.user) },
    role: 'student',
    isActive: true,
  });

  await notifyMany(
    users.map((u) => u._id),
    { title, message, type }
  );

  res.json({ success: true, message: `Notification sent to ${users.length} students` });
});
