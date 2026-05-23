import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: String,
  date: Date,
  url: String,
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  technologies: [String],
  githubUrl: String,
  liveUrl: String,
});

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    branch: {
      type: String,
      required: true,
      enum: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'OTHER'],
    },
    cgpa: { type: Number, required: true, min: 0, max: 10 },
    skills: [{ type: String, trim: true }],
    backlogs: { type: Number, default: 0, min: 0 },
    resume: { type: String },
    linkedin: String,
    github: String,
    certifications: [certificationSchema],
    projects: [projectSchema],
    atsScore: { type: Number, min: 0, max: 100 },
    aiAnalysis: {
      skillMatchPercentage: { type: Number, default: 0 },
      jobReadinessLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'N/A'], default: 'N/A' },
      evaluationFactors: {
        skillsRelevance: String,
        projectQuality: String,
        experienceLevel: String,
        educationRelevance: String,
        formattingAndStructureQuality: String,
      },
      improvementSuggestions: [String],
      jobRoleCompatibility: [
        {
          role: String,
          score: Number,
        }
      ],
      extractedSkills: {
        technical: [String],
        soft: [String],
      }
    },
    placementStatus: {
      type: String,
      enum: ['unplaced', 'placed', 'intern'],
      default: 'unplaced',
    },
    placedCompany: String,
    placedPackage: Number,
  },
  { timestamps: true }
);

studentSchema.index({ branch: 1, cgpa: -1 });
studentSchema.index({ placementStatus: 1 });

const Student = mongoose.model('Student', studentSchema);
export default Student;
