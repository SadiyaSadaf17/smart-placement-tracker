import mongoose from 'mongoose';

const scoreHistorySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    score: { type: Number, required: true, min: 0, max: 100 },
    previousScore: { type: Number, min: 0, max: 100 },
    delta: { type: Number, default: 0 },
    breakdown: { type: mongoose.Schema.Types.Mixed, required: true },
    weakAreas: [{ key: String, label: String, score: Number, severity: String }],
    suggestions: [{ key: String, title: String, description: String, priority: String }],
    sourceHash: { type: String, required: true },
    calculatedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

scoreHistorySchema.index({ student: 1, calculatedAt: -1 });

const ScoreHistory = mongoose.model('ScoreHistory', scoreHistorySchema);
export default ScoreHistory;
