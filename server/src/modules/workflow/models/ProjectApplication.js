import mongoose from 'mongoose';

const ProjectApplicationSchema = new mongoose.Schema({
  requirementId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'ProjectRequirement' },
  trainerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // Points to User model
  bidAmount: { type: Number, required: true, min: 1 },
  proposedTimeline: { type: String, required: true, trim: true },
  coverLetter: { type: String, required: true },
  status: {
    type: String,
    default: 'APPLIED',
    enum: ['APPLIED', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'ACCEPTED', 'REJECTED']
  }
}, {
  timestamps: true,
  collection: 'project_applications'
});

// Enforce specialized indexing for faster tracking queries
ProjectApplicationSchema.index({ requirementId: 1, status: 1 });
ProjectApplicationSchema.index({ trainerId: 1 });

export default mongoose.model('ProjectApplication', ProjectApplicationSchema);
