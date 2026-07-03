import mongoose from 'mongoose';

const TrainerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  fullName: { type: String, required: true, trim: true },
  bio: { type: String, required: true, maxLength: 1000 },
  skills: {
    type: [String],
    required: true,
    validate: [v => Array.isArray(v) && v.length > 0, 'At least one technical skill tag is mandated.']
  },
  experienceYears: { type: Number, required: true, min: 0 },
  hourlyRate: { type: Number, required: true, min: 1 },
  dailyRate: { type: Number, required: true, min: 1 },
  location: {
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true }
  },
  modePreference: { type: String, required: true, enum: ['REMOTE', 'HYBRID', 'ONSITE'] },
  availabilityStatus: { type: String, default: 'Flexible', enum: ['Flexible', 'Full-time', 'Part-time', 'Unavailable', 'AVAILABLE', 'BUSY'] },
  verificationStatus: { type: String, default: 'PENDING', enum: ['PENDING', 'VERIFIED', 'REJECTED'] },
  averageRating: { type: Number, default: 0.0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  achievements: [{
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    mediaUrl: { type: String, default: null },
    postedAt: { type: Date, default: Date.now }
  }],
  portfolio: [{
    title: { type: String, required: true, trim: true },
    students: { type: Number, required: true, min: 0 },
    duration: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    year: { type: Number, required: true }
  }],
  certifications: [{
    name: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    verified: { type: Boolean, default: false }
  }]
}, {
  timestamps: true,
  collection: 'trainer_profiles'
});

// Structural Compound Indexes for optimized multi-vector marketplace filtering
TrainerProfileSchema.index({ skills: 1, availabilityStatus: 1 });
TrainerProfileSchema.index({ 'location.city': 1, modePreference: 1 });

export default mongoose.model('TrainerProfile', TrainerProfileSchema);
