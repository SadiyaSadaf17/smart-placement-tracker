import mongoose from 'mongoose';

const bulkUploadBatchSchema = new mongoose.Schema(
  {
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true },
    summary: {
      totalRows: { type: Number, default: 0 },
      validRows: { type: Number, default: 0 },
      invalidRows: { type: Number, default: 0 },
      duplicateRows: { type: Number, default: 0 },
    },
    status: { type: String, enum: ['previewed', 'committed', 'failed'], default: 'previewed' },
    credentials: [
      {
        email: String,
        rollNumber: String,
        fullName: String,
        temporaryPassword: String,
      },
    ],
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

bulkUploadBatchSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BulkUploadBatch = mongoose.model('BulkUploadBatch', bulkUploadBatchSchema);
export default BulkUploadBatch;
