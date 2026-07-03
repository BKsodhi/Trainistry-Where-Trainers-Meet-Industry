import mongoose from 'mongoose';

const CompanyProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  companyName: { type: String, required: true, trim: true },
  websiteUrl: { type: String, required: true, trim: true },
  officialEmail: { type: String, required: true, trim: true },
  industry: { type: String, required: true },
  companySize: { type: String, required: true },
  verificationStatus: { type: String, default: 'PENDING', enum: ['PENDING', 'VERIFIED', 'REJECTED'] }
}, {
  timestamps: true,
  collection: 'company_profiles'
});

export default mongoose.model('CompanyProfile', CompanyProfileSchema);
