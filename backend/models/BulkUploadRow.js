import mongoose from 'mongoose';

const bulkUploadRowSchema = new mongoose.Schema(
  {
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'BulkUploadBatch', required: true, index: true },
    rowNumber: { type: Number, required: true },
    status: { type: String, enum: ['valid', 'invalid', 'duplicate'], required: true, index: true },
    errors: [
      {
        field: String,
        type: String,
        message: String,
      },
    ],
    data: {
      email: String,
      fullName: String,
      phone: String,
      rollNumber: String,
      branch: String,
      department: String,
      academicYear: Number,
      cgpa: Number,
      skills: [String],
      backlogs: Number,
    },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

bulkUploadRowSchema.index({ batch: 1, rowNumber: 1 });
bulkUploadRowSchema.index({ batch: 1, status: 1 });
bulkUploadRowSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BulkUploadRow = mongoose.model('BulkUploadRow', bulkUploadRowSchema);
export default BulkUploadRow;
