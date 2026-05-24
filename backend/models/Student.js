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
    personalEmail: { type: String, trim: true, lowercase: true },
    collegeEmail: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    dateOfBirth: Date,
    address: { type: String, trim: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    batchYear: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => !value || /^\d{4}-\d{4}$/.test(value),
        message: 'Batch year must look like 2022-2026',
      },
    },
    section: { type: String, trim: true, uppercase: true },
    branch: {
      type: String,
      required: true,
      enum: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'OTHER'],
    },
    department: { type: String, trim: true },
    academicYear: { type: Number, min: 1, max: 6 },
    currentYear: { type: Number, min: 1, max: 6 },
    cgpa: { type: Number, required: true, min: 0, max: 10 },
    graduationPercentage: { type: Number, min: 0, max: 100 },
    tenthPercentage: { type: Number, min: 0, max: 100 },
    twelfthPercentage: { type: Number, min: 0, max: 100 },
    diplomaPercentage: { type: Number, min: 0, max: 100 },
    skills: [{ type: String, trim: true }],
    backlogs: { type: Number, default: 0, min: 0 },
    activeBacklogs: { type: Number, default: 0, min: 0 },
    backlogHistory: [
      {
        semester: { type: Number, min: 1, max: 12 },
        subject: { type: String, trim: true },
        status: { type: String, enum: ['active', 'cleared'], default: 'active' },
        clearedAt: Date,
      },
    ],
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
    placementConsentStatus: {
      type: String,
      enum: ['pending', 'interested', 'not_interested', 'higher_studies'],
      default: 'pending',
    },
    placementBlocked: { type: Boolean, default: false },
    currentOfferStatus: {
      type: String,
      enum: ['none', 'pending', 'accepted', 'rejected'],
      default: 'none',
    },
    acceptedOfferId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
    placementEligibilityStatus: {
      type: String,
      enum: ['eligible', 'not_eligible', 'needs_review'],
      default: 'needs_review',
    },
    placedCompany: String,
    placedPackage: Number,
  },
  { timestamps: true }
);

studentSchema.index({ branch: 1, cgpa: -1 });
studentSchema.index({ department: 1, branch: 1, academicYear: 1 });
studentSchema.index({ department: 1, section: 1, batchYear: 1, currentYear: 1 });
studentSchema.index({ placementEligibilityStatus: 1, placementBlocked: 1 });
studentSchema.index({ placementStatus: 1 });
studentSchema.index({ branch: 1, placementStatus: 1 });
studentSchema.index({ placedCompany: 1, placedPackage: -1 });

const Student = mongoose.model('Student', studentSchema);
export default Student;
