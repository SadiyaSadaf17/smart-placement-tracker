import mongoose from 'mongoose';

const consentHistorySchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    previousStatus: String,
    newStatus: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: String,
  },
  { timestamps: true }
);

const ConsentHistory = mongoose.model('ConsentHistory', consentHistorySchema);
export default ConsentHistory;
