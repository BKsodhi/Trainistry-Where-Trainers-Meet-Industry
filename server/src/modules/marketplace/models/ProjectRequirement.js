import mongoose from 'mongoose';

const ProjectRequirementSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requiredSkills: {
    type: [String],
    required: true,
    validate: [v => Array.isArray(v) && v.length > 0, 'Must specify at least one required skill tag.']
  },
  durationInDays: { type: Number, required: true, min: 1 },
  mode: { type: String, required: true, enum: ['REMOTE', 'HYBRID', 'ONSITE'] },
  location: { type: String, required: true, trim: true }, 
  experienceLevelRequired: { type: String, required: true, enum: ['JUNIOR', 'MID', 'SENIOR', 'LEAD'] },
  budgetMin: { type: Number, required: true, min: 1 },
  budgetMax: { type: Number, required: true, min: 1 },
  status: { type: String, default: 'OPEN', enum: ['OPEN', 'FILLED', 'CANCELLED'] }
}, {
  timestamps: true,
  collection: 'project_requirements'
});

// Production Compound Indexes for Multi-Vector Searching
ProjectRequirementSchema.index({ requiredSkills: 1, status: 1 });
ProjectRequirementSchema.index({ budgetMin: 1, budgetMax: 1 });

export default mongoose.model('ProjectRequirement', ProjectRequirementSchema);
