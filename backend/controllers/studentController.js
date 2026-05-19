import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Student from '../models/Student.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Application from '../models/Application.js';
import asyncHandler from '../utils/asyncHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { checkEligibility } from '../utils/eligibility.js';
import {
  calculateATSScore,
  skillGapAnalysis,
  recommendDrives,
  placementPrediction,
} from '../utils/aiHelpers.js';

export const getProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).populate('user', 'email');
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }
  res.json({ success: true, data: student });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = [
    'fullName', 'phone', 'branch', 'cgpa', 'skills', 'backlogs',
    'linkedin', 'github', 'certifications', 'projects',
  ];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const student = await Student.findOneAndUpdate(
    { user: req.user._id },
    updates,
    { new: true, runValidators: true }
  );

  student.atsScore = calculateATSScore(student);
  await student.save();

  res.json({ success: true, data: student });
});

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a PDF resume');
  }

  const resumePath = `/uploads/resumes/${req.file.filename}`;
  const student = await Student.findOneAndUpdate(
    { user: req.user._id },
    { resume: resumePath },
    { new: true }
  );

  student.atsScore = calculateATSScore(student);
  await student.save();

  res.json({ success: true, data: student, resume: resumePath });
});

export const downloadResume = asyncHandler(async (req, res) => {
  const student = req.student;
  if (!student?.resume) {
    res.status(404);
    throw new Error('No resume uploaded');
  }
  const relative = student.resume.replace(/^\//, '');
  const filePath = path.resolve(__dirname, '..', relative);
  if (!fs.existsSync(filePath)) {
    res.status(404);
    throw new Error('Resume file not found');
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');
  res.sendFile(filePath);
});

export const getEligibleDrives = asyncHandler(async (req, res) => {
  const student = req.student;
  const drives = await PlacementDrive.find({
    driveStatus: { $in: ['upcoming', 'active'] },
  }).sort({ interviewDate: 1 });

  const appliedDriveIds = (
    await Application.find({ student: student._id }).select('drive')
  ).map((a) => a.drive.toString());

  const enriched = drives.map((drive) => {
    const eligibility = checkEligibility(student, drive);
    return {
      ...drive.toObject(),
      eligibility,
      hasApplied: appliedDriveIds.includes(drive._id.toString()),
    };
  });

  res.json({ success: true, data: enriched });
});

export const getStudentAnalytics = asyncHandler(async (req, res) => {
  const student = req.student;
  const applications = await Application.find({ student: student._id })
    .populate('drive', 'companyName role package');

  const stats = {
    totalApplications: applications.length,
    selected: applications.filter((a) => a.currentRound === 'Selected').length,
    rejected: applications.filter((a) => a.currentRound === 'Rejected').length,
    inProgress: applications.filter(
      (a) => !['Selected', 'Rejected'].includes(a.currentRound)
    ).length,
    atsScore: student.atsScore || calculateATSScore(student),
    placementPrediction: placementPrediction(student),
  };

  res.json({ success: true, data: stats, applications });
});

export const getAIInsights = asyncHandler(async (req, res) => {
  const student = req.student;
  const drives = await PlacementDrive.find({ driveStatus: { $in: ['upcoming', 'active'] } });

  const driveId = req.query.driveId;
  let skillGap = null;
  if (driveId) {
    const drive = await PlacementDrive.findById(driveId);
    if (drive) skillGap = skillGapAnalysis(student, drive);
  }

  res.json({
    success: true,
    data: {
      atsScore: calculateATSScore(student),
      skillGap,
      recommendations: recommendDrives(student, drives),
      placementPrediction: placementPrediction(student),
    },
  });
});

export const getLeaderboard = asyncHandler(async (req, res) => {
  const students = await Student.find()
    .select('fullName branch cgpa skills atsScore placementStatus')
    .sort({ atsScore: -1, cgpa: -1 })
    .limit(20);

  res.json({ success: true, data: students });
});
