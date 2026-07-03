import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Enterprise Business Logic Processor for Identity Authentication
 */
export const registerNewUser = async (email, password, role) => {
  // 1. Prevent duplicate identity collisions
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  // 2. Compute cryptographically safe password hash range (Bcrypt 12 rounds)
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // 3. Persist record to data engine ledger
  const newUser = await User.create({
    email,
    passwordHash,
    role
  });

  return {
    userId: newUser._id,
    email: newUser.email,
    role: newUser.role,
    isOnboarded: newUser.isOnboarded
  };
};

export const validateUserCredentials = async (email, password) => {
  // 1. Squeeze profile entity matching current record targets
  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // 2. Audit account system blockades
  if (user.accountStatus === 'SUSPENDED') {
    throw new Error('ACCOUNT_SUSPENDED');
  }

  // 3. Evaluate password cryptographic compliance match
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // 4. Issue system token signed assertion parameters
  const tokenString = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token: tokenString,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      isOnboarded: user.isOnboarded
    }
  };
};
