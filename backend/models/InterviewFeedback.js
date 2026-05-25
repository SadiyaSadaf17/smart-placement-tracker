import mongoose from 'mongoose';

const interviewFeedbackSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', index: true },
    drive: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', index: true },
    communicationScore: { type: Number, min: 0, max: 10, default: 0 },
    technicalScore: { type: Number, min: 0, max: 10, default: 0 },
    hrScore: { type: Number, min: 0, max: 10, default: 0 },
    confidenceScore: { type: Number, min: 0, max: 10, default: 0 },
    overallScore: { type: Number, min: 0, max: 10, default: 0 },
    feedbackNotes: String,
    improvementSuggestions: [String],
    evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

interviewFeedbackSchema.index({ student: 1, createdAt: -1 });

const InterviewFeedback = mongoose.model('InterviewFeedback', interviewFeedbackSchema);
export default InterviewFeedback;
