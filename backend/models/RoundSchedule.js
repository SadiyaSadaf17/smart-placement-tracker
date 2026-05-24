import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    venue: String,
    meetingLink: String,
    panel: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    attendance: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        status: { type: String, enum: ['present', 'absent', 'pending'], default: 'pending' },
      },
    ],
  },
  { _id: true }
);

const roundScheduleSchema = new mongoose.Schema(
  {
    drive: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true, index: true },
    roundType: {
      type: String,
      enum: ['aptitude', 'coding', 'technical_interview', 'hr_interview', 'group_discussion'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    instructions: String,
    slots: [slotSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

roundScheduleSchema.index({ drive: 1, roundType: 1 });

const RoundSchedule = mongoose.model('RoundSchedule', roundScheduleSchema);
export default RoundSchedule;
