import mongoose from 'mongoose';

const placementDriveSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    companyName: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    package: { type: Number, required: true, min: 0 },
    location: { type: String, required: true },
    description: { type: String, default: '' },
    eligibility: {
      minCgpa: { type: Number, default: 0, min: 0, max: 10 },
      allowedBranches: {
        type: [String],
        default: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'OTHER'],
      },
      maxBacklogs: { type: Number, default: 0, min: 0 },
    },
    requiredSkills: [{ type: String, trim: true }],
    interviewDate: { type: Date },
    driveStatus: {
      type: String,
      enum: ['upcoming', 'active', 'closed', 'cancelled'],
      default: 'upcoming',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  { timestamps: true }
);

placementDriveSchema.index({ driveStatus: 1, interviewDate: 1 });
placementDriveSchema.index({ companyName: 'text', role: 'text' });
placementDriveSchema.index({ companyName: 1, interviewDate: -1 });
placementDriveSchema.index({ package: -1 });

const PlacementDrive = mongoose.model('PlacementDrive', placementDriveSchema);
export default PlacementDrive;
