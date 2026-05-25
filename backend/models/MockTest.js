import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: {
        validator: (options) => Array.isArray(options) && options.length >= 2,
        message: 'Each question must have at least two options',
      },
    },
    correctOption: { type: Number, required: true, min: 0 },
    marks: { type: Number, default: 1, min: 1 },
  },
  { _id: true }
);

const mockTestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    durationMinutes: { type: Number, required: true, min: 1 },
    codingLink: String,
    assignedDepartments: [String],
    assignedBatches: [String],
    isPublished: { type: Boolean, default: false, index: true },
    allowRetake: { type: Boolean, default: false },
    questions: [questionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

mockTestSchema.pre('validate', function validateQuestions(next) {
  if (!Array.isArray(this.questions) || this.questions.length === 0) {
    this.invalidate('questions', 'At least one question is required');
  }

  this.questions?.forEach((question, index) => {
    if (question.correctOption >= (question.options?.length || 0)) {
      this.invalidate(`questions.${index}.correctOption`, 'Correct option must match one of the options');
    }
  });

  next();
});

mockTestSchema.index({ assignedDepartments: 1, assignedBatches: 1, isPublished: 1 });

const MockTest = mongoose.model('MockTest', mockTestSchema);
export default MockTest;
