import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorRole: { type: String, required: true },
  content: { type: String, required: true, maxlength: 500 },
  type: { 
    type: String, 
    required: true, 
    enum: ['achievement', 'milestone', 'warning'],
    default: 'achievement'
  },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reports: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  commentsList: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  collection: 'posts'
});

export default mongoose.model('Post', PostSchema);
