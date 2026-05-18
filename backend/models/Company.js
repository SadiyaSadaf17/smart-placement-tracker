import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    website: String,
    industry: String,
    location: String,
    description: String,
    logo: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

companySchema.index({ name: 'text' });

const Company = mongoose.model('Company', companySchema);
export default Company;
