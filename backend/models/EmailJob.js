import mongoose from 'mongoose';

const emailJobSchema = new mongoose.Schema(
  {
    to: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    html: String,
    text: String,
    template: String,
    payload: mongoose.Schema.Types.Mixed,
    status: { type: String, enum: ['queued', 'sent', 'failed'], default: 'queued', index: true },
    attempts: { type: Number, default: 0 },
    lastError: String,
    nextAttemptAt: { type: Date, default: Date.now, index: true },
    sentAt: Date,
  },
  { timestamps: true }
);

const EmailJob = mongoose.model('EmailJob', emailJobSchema);
export default EmailJob;
