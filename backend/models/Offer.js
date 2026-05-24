import mongoose from 'mongoose';

const offerHistorySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const offerSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true, index: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', index: true },
    packageOffered: { type: Number, required: true, min: 0 },
    role: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    offerLetterUrl: String,
    offerStatus: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending', index: true },
    adminVerificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    acceptedAt: Date,
    rejectedAt: Date,
    remarks: String,
    history: [offerHistorySchema],
  },
  { timestamps: true }
);

offerSchema.index({ studentId: 1, driveId: 1 }, { unique: true });
offerSchema.index({ offerStatus: 1, adminVerificationStatus: 1 });

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;
