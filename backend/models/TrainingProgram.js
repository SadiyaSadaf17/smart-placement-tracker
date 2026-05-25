import mongoose from 'mongoose';

const trainingProgramSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    targetSkills: [String],
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    assignedDepartments: [String],
    startDate: Date,
    endDate: Date,
    sessions: [{ title: String, scheduledAt: Date }],
    attendance: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        sessionTitle: String,
        status: { type: String, enum: ['present', 'absent'], required: true },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

trainingProgramSchema.index({ assignedDepartments: 1, startDate: -1 });

const TrainingProgram = mongoose.model('TrainingProgram', trainingProgramSchema);
export default TrainingProgram;
