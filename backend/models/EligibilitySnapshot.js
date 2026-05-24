import mongoose from 'mongoose';

const eligibilityStudentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    fullName: String,
    rollNumber: String,
    department: String,
    section: String,
    batchYear: String,
    branch: String,
    eligible: Boolean,
    reasons: [String],
    skillMatch: Number,
  },
  { _id: false }
);

const eligibilitySnapshotSchema = new mongoose.Schema(
  {
    drive: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true, unique: true, index: true },
    driveVersion: String,
    eligibleCount: { type: Number, default: 0 },
    ineligibleCount: { type: Number, default: 0 },
    departmentStats: [
      {
        department: String,
        eligible: Number,
        ineligible: Number,
        total: Number,
      },
    ],
    students: [eligibilityStudentSchema],
    calculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const EligibilitySnapshot = mongoose.model('EligibilitySnapshot', eligibilitySnapshotSchema);
export default EligibilitySnapshot;
