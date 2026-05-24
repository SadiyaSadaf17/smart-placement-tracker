import mongoose from 'mongoose';

const placementPolicySchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Default Placement Policy', unique: true },
    oneStudentOneOffer: { type: Boolean, default: true },
    lockAfterAcceptedOffer: { type: Boolean, default: true },
    minimumPackageForUpgrade: { type: Number, default: 0 },
    allowMultipleOffers: { type: Boolean, default: false },
    dreamPackageThreshold: { type: Number, default: 10 },
    superDreamPackageThreshold: { type: Number, default: 20 },
    branchRules: [
      {
        branch: String,
        allowedCompanyTypes: [String],
        minimumPackage: Number,
      },
    ],
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const PlacementPolicy = mongoose.model('PlacementPolicy', placementPolicySchema);
export default PlacementPolicy;
