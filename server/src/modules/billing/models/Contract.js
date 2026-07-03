import mongoose from 'mongoose';

const MilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 1 },
  status: { 
    type: String, 
    default: 'PENDING', 
    enum: ['PENDING', 'FUNDED', 'IN_REVIEW', 'APPROVED', 'RELEASED'] 
  }
});

const ContractSchema = new mongoose.Schema({
  requirementId: { type: mongoose.Schema.Types.ObjectId, required: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  trainerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  totalContractValue: { type: Number, required: true, min: 1 },
  status: { 
    type: String, 
    default: 'PENDING', 
    enum: ['PENDING', 'ACTIVE', 'COMPLETED', 'DISPUTED'] 
  },
  milestones: [MilestoneSchema]
}, {
  timestamps: true,
  collection: 'contracts'
});

ContractSchema.index({ companyId: 1, status: 1 });
ContractSchema.index({ trainerId: 1 });

export default mongoose.model('Contract', ContractSchema);
