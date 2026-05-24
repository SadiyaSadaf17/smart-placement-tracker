import RoundSchedule from '../models/RoundSchedule.js';
import asyncHandler from '../utils/asyncHandler.js';
import { assertNoScheduleConflicts } from '../services/scheduleService.js';
import { notifyMany } from '../services/notificationService.js';
import Student from '../models/Student.js';
import { logAudit } from '../services/auditService.js';

export const createSchedule = asyncHandler(async (req, res) => {
  await assertNoScheduleConflicts({ slots: req.body.slots || [] });
  const schedule = await RoundSchedule.create({
    ...req.body,
    createdBy: req.user._id,
  });

  const assignedStudentIds = schedule.slots.flatMap((slot) => slot.assignedStudents);
  const students = await Student.find({ _id: { $in: assignedStudentIds } }).select('user');
  if (students.length) {
    await notifyMany(students.map((student) => student.user), {
      title: 'Placement Round Scheduled',
      message: `${schedule.title} has been scheduled.`,
      type: 'application',
      link: '/student/schedule',
    });
  }

  await logAudit({
    actor: req.user,
    actionType: 'ROUND_SCHEDULE_CREATED',
    targetEntity: 'RoundSchedule',
    targetId: schedule._id,
    newValues: schedule.toObject(),
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, data: schedule });
});

export const getSchedules = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.driveId) query.drive = req.query.driveId;
  const schedules = await RoundSchedule.find(query)
    .populate('drive', 'companyName role')
    .populate('slots.assignedStudents', 'fullName rollNumber branch department')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: schedules });
});

export const getMySchedules = asyncHandler(async (req, res) => {
  const schedules = await RoundSchedule.find({ 'slots.assignedStudents': req.student._id })
    .populate('drive', 'companyName role')
    .sort({ 'slots.startTime': 1 });
  res.json({ success: true, data: schedules });
});

export const updateAttendance = asyncHandler(async (req, res) => {
  const { slotId, studentId, status } = req.body;
  const schedule = await RoundSchedule.findById(req.params.id);
  if (!schedule) {
    res.status(404);
    throw new Error('Schedule not found');
  }

  const slot = schedule.slots.id(slotId);
  if (!slot) {
    res.status(404);
    throw new Error('Slot not found');
  }

  const existing = slot.attendance.find((entry) => entry.student.toString() === studentId);
  if (existing) existing.status = status;
  else slot.attendance.push({ student: studentId, status });
  await schedule.save();

  res.json({ success: true, data: schedule });
});
