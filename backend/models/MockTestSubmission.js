import mongoose from 'mongoose';

const mockTestSubmissionSchema = new mongoose.Schema(
  {
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    attemptNumber: { type: Number, default: 1, min: 1 },
    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'auto_submitted', 'expired', 'terminated'],
      default: 'in_progress',
      index: true,
    },
    questionOrder: [{ type: mongoose.Schema.Types.ObjectId }],
    optionOrders: [{
      questionId: mongoose.Schema.Types.ObjectId,
      order: [Number],
    }],
    answers: [{
      questionId: mongoose.Schema.Types.ObjectId,
      selectedOption: Number,
      markedForReview: { type: Boolean, default: false },
      visited: { type: Boolean, default: false },
      answeredAt: Date,
    }],
    sectionScores: [{
      section: String,
      score: { type: Number, default: 0 },
      totalMarks: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      incorrect: { type: Number, default: 0 },
      unanswered: { type: Number, default: 0 },
    }],
    difficultyScores: [{
      difficulty: String,
      score: { type: Number, default: 0 },
      totalMarks: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      incorrect: { type: Number, default: 0 },
      unanswered: { type: Number, default: 0 },
    }],
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    unansweredCount: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now, index: true },
    endsAt: { type: Date, required: true, index: true },
    lastSavedAt: Date,
    submittedAt: Date,
    autoSubmitted: { type: Boolean, default: false },
    timeSpentSeconds: { type: Number, default: 0 },
    antiCheat: {
      tabSwitches: { type: Number, default: 0 },
      fullscreenExits: { type: Number, default: 0 },
      copyAttempts: { type: Number, default: 0 },
      pasteAttempts: { type: Number, default: 0 },
      suspiciousEvents: [{
        type: { type: String, enum: ['tab_switch', 'fullscreen_exit', 'copy', 'paste', 'window_blur', 'manual'] },
        occurredAt: { type: Date, default: Date.now },
        detail: String,
      }],
      flagged: { type: Boolean, default: false },
      terminatedReason: String,
    },
  },
  { timestamps: true }
);

mockTestSubmissionSchema.index({ test: 1, student: 1, attemptNumber: 1 }, { unique: true });
mockTestSubmissionSchema.index({ student: 1, submittedAt: -1 });
mockTestSubmissionSchema.index({ test: 1, status: 1, percentage: -1, timeSpentSeconds: 1 });

const MockTestSubmission = mongoose.model('MockTestSubmission', mockTestSubmissionSchema);
export default MockTestSubmission;
