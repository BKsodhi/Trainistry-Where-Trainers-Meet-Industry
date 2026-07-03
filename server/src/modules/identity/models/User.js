import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Structural authentication requires an explicit email entry.'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/, 'Invalid email notation profile layout.']
  },
  passwordHash: {
    type: String,
    required: [true, 'Cryptographic balance verification targets missing string bounds.']
  },
  role: {
    type: String,
    required: true,
    enum: {
      values: ['TRAINER', 'COMPANY', 'ADMIN'],
      message: 'Supplied profile parameter `{VALUE}` violates systemic RBAC limits.'
    }
  },
  isOnboarded: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  accountStatus: { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'SUSPENDED'] }
}, {
  timestamps: true,
  collection: 'users'
});

export default mongoose.model('User', UserSchema);
