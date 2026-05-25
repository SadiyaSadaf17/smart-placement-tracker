import CalendarEvent from '../models/CalendarEvent.js';
import asyncHandler from '../utils/asyncHandler.js';
import { logAudit } from '../services/auditService.js';

export const createCalendarEvent = asyncHandler(async (req, res) => {
  const event = await CalendarEvent.create({ ...req.body, createdBy: req.user._id });
  await logAudit({ actor: req.user, actionType: 'CALENDAR_EVENT_CREATED', targetEntity: 'CalendarEvent', targetId: event._id, newValues: event.toObject(), ipAddress: req.ip });
  res.status(201).json({ success: true, data: event });
});

export const getCalendarEvents = asyncHandler(async (req, res) => {
  const { from, to, type } = req.query;
  const query = {};
  if (type) query.type = type;
  if (from || to) {
    query.startAt = {};
    if (from) query.startAt.$gte = new Date(from);
    if (to) query.startAt.$lte = new Date(to);
  }
  if (req.user.role === 'student') query.visibility = { $in: ['all', 'student'] };
  const events = await CalendarEvent.find(query).sort({ startAt: 1 }).limit(500);
  res.json({ success: true, data: events });
});
