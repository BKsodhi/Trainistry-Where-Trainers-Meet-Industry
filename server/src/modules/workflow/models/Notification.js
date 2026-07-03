import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true, enum: ['STATUS_UPDATE', 'SYSTEM_ALERT', 'MESSAGE'] },
  read: { type: Boolean, default: false },
  actionLink: { type: String, default: null }
}, {
  timestamps: true,
  collection: 'notifications'
});

NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Notification', NotificationSchema);
