import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema(
  {
    raw: { type: Number, default: 0, min: 0, max: 100 },
    weighted: { type: Number, default: 0, min: 0 },
    weight: { type: Number, required: true, min: 0, max: 1 },
    label: { type: String, required: true },
    value: mongoose.Schema.Types.Mixed,
    maxValue: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const readinessScoreSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true,
      index: true,
    },
    score: { type: Number, default: 0, min: 0, max: 100 },
    grade: {
      type: String,
      enum: ['Needs Work', 'Developing', 'Ready', 'Highly Ready'],
      default: 'Needs Work',
    },
    breakdown: {
      atsResume: metricSchema,
      skills: metricSchema,
      cgpa: metricSchema,
      applications: metricSchema,
      mockTests: metricSchema,
      interviews: metricSchema,
      profileCompletion: metricSchema,
    },
    weakAreas: [
      {
        key: String,
        label: String,
        score: Number,
        severity: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
      },
    ],
    suggestions: [
      {
        key: String,
        title: String,
        description: String,
        priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
      },
    ],
    insights: [String],
    sourceHash: { type: String, required: true },
    calculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

readinessScoreSchema.index({ score: -1 });
readinessScoreSchema.index({ calculatedAt: -1 });

const ReadinessScore = mongoose.model('ReadinessScore', readinessScoreSchema);
export default ReadinessScore;
