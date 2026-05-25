import mongoose from 'mongoose';

const mockTestSubmissionSchema = new mongoose.Schema(
  {
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    answers: [{ questionId: mongoose.Schema.Types.ObjectId, selectedOption: Number }],
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    autoSubmitted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

mockTestSubmissionSchema.index({ test: 1, student: 1 }, { unique: true });

const MockTestSubmission = mongoose.model('MockTestSubmission', mockTestSubmissionSchema);
export default MockTestSubmission;
