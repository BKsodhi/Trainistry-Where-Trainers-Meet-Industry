import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  contractId: { type: mongoose.Schema.Types.ObjectId, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Points to User ID receiving the score
  authorRole: { type: String, required: true, enum: ['TRAINER', 'COMPANY'] },
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String, required: true, trim: true, maxLength: 500 }
}, {
  timestamps: true,
  collection: 'reviews'
});

ReviewSchema.index({ targetId: 1 });

export default mongoose.model('Review', ReviewSchema);
