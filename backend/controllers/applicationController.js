import Application, { ROUND_STATUSES } from '../models/Application.js';
import Student from '../models/Student.js';
import PlacementDrive from '../models/PlacementDrive.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { checkEligibility } from '../utils/eligibility.js';
import { createNotification } from '../services/notificationService.js';
import { emitToAdmin, emitToUser } from '../config/socket.js';

export const applyForDrive = asyncHandler(async (req, res) => {
  const student = req.student || (await Student.findOne({ user: req.user._id }));
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }
  const drive = await PlacementDrive.findById(req.params.driveId);

  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }

  if (!['upcoming', 'active'].includes(drive.driveStatus)) {
    res.status(400);
    throw new Error('Drive is not open for applications');
  }

  if (student.placementStatus === 'placed') {
    res.status(400);
    throw new Error('You are already placed and cannot apply for new drives');
  }

  const { eligible, reasons } = checkEligibility(student, drive);
  if (!eligible) {
    res.status(400);
    throw new Error(`Not eligible: ${reasons.join('; ')}`);
  }

  const existing = await Application.findOne({ student: student._id, drive: drive._id });
  if (existing) {
    res.status(400);
    throw new Error('Already applied for this drive');
  }

  const application = await Application.create({
    student: student._id,
    drive: drive._id,
    currentRound: 'Applied',
    roundHistory: [{ round: 'Applied', status: 'pending' }],
  });

  await createNotification({
    recipient: req.user._id,
    title: 'Application Submitted',
    message: `You applied for ${drive.companyName} - ${drive.role}`,
    type: 'application',
    link: '/student/applications',
  });

  emitToAdmin('new-application', { application, drive, student });

  const populated = await Application.findById(application._id)
    .populate('drive', 'companyName role package location')
    .populate('student', 'fullName rollNumber branch');

  res.status(201).json({ success: true, data: populated });
});

export const getAllApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, round, search, driveId } = req.query;
  const query = {};
  if (round) query.currentRound = round;
  if (driveId) query.drive = driveId;

  let studentIds = null;
  if (search) {
    const students = await Student.find({
      $or: [
        { fullName: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');
    studentIds = students.map((s) => s._id);
    query.student = { $in: studentIds };
  }

  const total = await Application.countDocuments(query);
  const applications = await Application.find(query)
    .populate('student', 'fullName rollNumber branch cgpa')
    .populate('drive', 'companyName role package')
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    success: true,
    data: applications,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
});

export const getMyApplications = asyncHandler(async (req, res) => {
  const student = req.student || (await Student.findOne({ user: req.user._id }));
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }
  const applications = await Application.find({ student: student._id })
    .populate('drive')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: applications });
});

export const getDriveApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, round, search } = req.query;
  const query = { drive: req.params.driveId };

  if (round) query.currentRound = round;

  let applications = await Application.find(query)
    .populate({
      path: 'student',
      match: search
        ? {
            $or: [
              { fullName: { $regex: search, $options: 'i' } },
              { rollNumber: { $regex: search, $options: 'i' } },
            ],
          }
        : {},
    })
    .populate('drive', 'companyName role')
    .sort({ createdAt: -1 });

  applications = applications.filter((a) => a.student);

  const total = applications.length;
  const start = (page - 1) * limit;
  const paginated = applications.slice(start, start + Number(limit));

  res.json({
    success: true,
    data: paginated,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
});

export const updateApplicationRound = asyncHandler(async (req, res) => {
  const { currentRound, remarks, status = 'passed' } = req.body;

  if (!currentRound || !ROUND_STATUSES.includes(currentRound)) {
    res.status(400);
    throw new Error(`Invalid round. Must be one of: ${ROUND_STATUSES.join(', ')}`);
  }

  const application = await Application.findById(req.params.id)
    .populate('student')
    .populate('drive');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  application.currentRound = currentRound;
  application.roundHistory.push({
    round: currentRound,
    status: currentRound === 'Rejected' ? 'failed' : status,
    remarks,
  });
  await application.save();

  const studentUser = await User.findById(application.student.user);
  if (!studentUser) {
    res.status(400);
    throw new Error('Student user account not found');
  }

  await createNotification({
    recipient: studentUser._id,
    title: 'Application Status Updated',
    message: `${application.drive.companyName}: Round updated to ${currentRound}`,
    type: currentRound === 'Selected' ? 'selection' : 'application',
    link: '/student/applications',
  });

  if (currentRound === 'Selected') {
    await Student.findByIdAndUpdate(application.student._id, {
      placementStatus: 'placed',
      placedCompany: application.drive.companyName,
      placedPackage: application.drive.package,
    });
    emitToUser(studentUser._id.toString(), 'selection', {
      company: application.drive.companyName,
      package: application.drive.package,
    });
  }

  emitToUser(studentUser._id.toString(), 'application-update', {
    round: currentRound,
    drive: application.drive.companyName,
  });

  res.json({ success: true, data: application });
});
