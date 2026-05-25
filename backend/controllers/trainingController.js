import TrainingProgram from '../models/TrainingProgram.js';
import asyncHandler from '../utils/asyncHandler.js';
import { logAudit } from '../services/auditService.js';

export const createTrainingProgram = asyncHandler(async (req, res) => {
  const program = await TrainingProgram.create({ ...req.body, createdBy: req.user._id });
  await logAudit({ actor: req.user, actionType: 'TRAINING_CREATED', targetEntity: 'TrainingProgram', targetId: program._id, newValues: program.toObject(), ipAddress: req.ip });
  res.status(201).json({ success: true, data: program });
});

export const getTrainingPrograms = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === 'student') {
    query.$or = [{ assignedStudents: req.student._id }, { assignedDepartments: req.student.department }];
  }
  const programs = await TrainingProgram.find(query).sort({ createdAt: -1 });
  res.json({ success: true, data: programs });
});

export const getTrainingAnalytics = asyncHandler(async (req, res) => {
  const programs = await TrainingProgram.find(
    req.user.role === 'student'
      ? { $or: [{ assignedStudents: req.student._id }, { assignedDepartments: req.student.department }] }
      : {}
  );

  const attendance = programs.flatMap((program) => program.attendance || []);
  const studentAttendance = req.user.role === 'student'
    ? attendance.filter((entry) => entry.student?.toString() === req.student._id.toString())
    : attendance;
  const present = studentAttendance.filter((entry) => entry.status === 'present').length;

  res.json({
    success: true,
    data: {
      assignedPrograms: programs.length,
      targetSkills: [...new Set(programs.flatMap((program) => program.targetSkills || []))],
      attendanceRecords: studentAttendance.length,
      attendancePercentage: studentAttendance.length ? Math.round((present / studentAttendance.length) * 100) : 0,
    },
  });
});

export const markTrainingAttendance = asyncHandler(async (req, res) => {
  const program = await TrainingProgram.findById(req.params.id);
  if (!program) {
    res.status(404);
    throw new Error('Training program not found');
  }
  program.attendance.push(req.body);
  await program.save();
  res.json({ success: true, data: program });
});
