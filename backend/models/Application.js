import mongoose from 'mongoose';

const ROUND_STATUSES = [
  'Applied',
  'Shortlisted',
  'Aptitude',
  'Technical Round',
  'HR Round',
  'Selected',
  'Rejected',
];

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      required: true,
    },
    currentRound: {
      type: String,
      enum: ROUND_STATUSES,
      default: 'Applied',
    },
    roundHistory: [
      {
        round: { type: String, enum: ROUND_STATUSES },
        status: { type: String, enum: ['passed', 'failed', 'pending'] },
        updatedAt: { type: Date, default: Date.now },
        remarks: String,
      },
    ],
    appliedAt: { type: Date, default: Date.now },
    notes: String,
    applicationDetails: {
      fullName: { type: String, trim: true },
      resume: { type: String },
      immediateJoiner: { type: Boolean },
      expectedStipend: { type: Number, min: 0 },
      contactDetails: { type: String, trim: true },
      additionalNotes: { type: String, trim: true, maxlength: 1000 },
    },
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, drive: 1 }, { unique: true });
applicationSchema.index({ currentRound: 1 });
applicationSchema.index({ drive: 1 });
applicationSchema.index({ currentRound: 1, updatedAt: -1 });
applicationSchema.index({ student: 1, currentRound: 1 });
applicationSchema.index({ appliedAt: -1 });

export { ROUND_STATUSES };
const Application = mongoose.model('Application', applicationSchema);
export default Application;
