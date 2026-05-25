import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['drive', 'test', 'interview', 'result', 'training', 'workshop'], required: true, index: true },
    description: String,
    startAt: { type: Date, required: true, index: true },
    endAt: Date,
    timezone: { type: String, default: 'Asia/Kolkata' },
    visibility: { type: String, enum: ['all', 'admin', 'student'], default: 'all' },
    recurrence: { frequency: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' }, until: Date },
    relatedDrive: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

calendarEventSchema.index({ startAt: 1, type: 1, visibility: 1 });

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
export default CalendarEvent;
