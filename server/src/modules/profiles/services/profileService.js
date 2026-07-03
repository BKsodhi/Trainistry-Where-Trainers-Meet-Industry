import TrainerProfile from '../models/TrainerProfile.js';
import CompanyProfile from '../models/CompanyProfile.js';
import Review from '../models/Review.js';
import User from '../../identity/models/User.js';

export const getTrainerProfile = async (userId) => {
  return await TrainerProfile.findOne({ userId });
};

export const upsertTrainerProfile = async (userId, profileData) => {
  const profile = await TrainerProfile.findOneAndUpdate(
    { userId },
    { userId, ...profileData },
    { new: true, upsert: true, runValidators: true }
  );
  
  // Set onboarding flag on User base layer record
  await User.findByIdAndUpdate(userId, { isOnboarded: true });
  return profile;
};

export const addTrainerAchievement = async (userId, achievementPayload) => {
  const profile = await TrainerProfile.findOne({ userId });
  if (!profile) throw new Error('PROFILE_NOT_FOUND');

  profile.achievements.unshift(achievementPayload); // Keep reverse-chronological order
  await profile.save();
  return profile.achievements[0];
};

export const addTrainerPortfolio = async (userId, portfolioPayload) => {
  const profile = await TrainerProfile.findOne({ userId });
  if (!profile) throw new Error('PROFILE_NOT_FOUND');

  profile.portfolio.unshift(portfolioPayload);
  await profile.save();
  return profile.portfolio[0];
};

export const addTrainerCertification = async (userId, certificationPayload) => {
  const profile = await TrainerProfile.findOne({ userId });
  if (!profile) throw new Error('PROFILE_NOT_FOUND');

  profile.certifications.unshift(certificationPayload);
  await profile.save();
  return profile.certifications[0];
};

export const processProfileReview = async (contractId, authorId, targetId, authorRole, rating, feedback) => {
  // 1. Prevent duplicate reviews for the same contract boundary from the same author
  const existingReview = await Review.findOne({ contractId, authorId });
  if (existingReview) throw new Error('DUPLICATE_REVIEW');

  // 2. Persist the raw evaluation record
  const review = await Review.create({ contractId, authorId, targetId, authorRole, rating, feedback });

  // 3. Incrementally compute running averages if target is a Trainer
  if (authorRole === 'COMPANY') {
    const trainerProfile = await TrainerProfile.findOne({ userId: targetId });
    if (trainerProfile) {
      const currentTotalScore = trainerProfile.averageRating * trainerProfile.reviewCount;
      trainerProfile.reviewCount += 1;
      trainerProfile.averageRating = (currentTotalScore + rating) / trainerProfile.reviewCount;
      await trainerProfile.save();
    }
  }

  return review;
};
