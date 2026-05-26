import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true, trim: true },
    department: { type: String, default: 'Training & Placement' },
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    phone: String,
  },
  { timestamps: true }
);

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
