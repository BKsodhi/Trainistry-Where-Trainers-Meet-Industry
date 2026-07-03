import * as profileService from '../services/profileService.js';

export const getTrainerProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getTrainerProfile(req.user.userId);
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const saveTrainerProfile = async (req, res, next) => {
  try {
    const profile = await profileService.upsertTrainerProfile(req.user.userId, req.body);
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const postAchievement = async (req, res) => {
  try {
    const { title, description, mediaUrl } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing fields.' } });
    }
    const achievement = await profileService.addTrainerAchievement(req.user.id, { title, description, mediaUrl });
    return res.status(201).json({ success: true, data: achievement });
  } catch (error) {
    if (error.message === 'PROFILE_NOT_FOUND') {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trainer profile layout missing.' } });
    }
    throw error;
  }
};

export const postPortfolio = async (req, res, next) => {
  try {
    const { title, students, duration, rating, year } = req.body;
    if (!title || students === undefined || !duration || rating === undefined || !year) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing fields.' } });
    }
    const portfolio = await profileService.addTrainerPortfolio(req.user.userId, { title, students, duration, rating, year });
    return res.status(201).json({ success: true, data: portfolio });
  } catch (error) {
    next(error);
  }
};

export const postCertification = async (req, res, next) => {
  try {
    const { name, issuer, year } = req.body;
    if (!name || !issuer || !year) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing fields.' } });
    }
    const certification = await profileService.addTrainerCertification(req.user.userId, { name, issuer, year });
    return res.status(201).json({ success: true, data: certification });
  } catch (error) {
    next(error);
  }
};

export const submitReview = async (req, res) => {
  try {
    const { contractId, targetId, rating, feedback } = req.body;
    const authorRole = req.user.role;

    const review = await profileService.processProfileReview(contractId, req.user.id, targetId, authorRole, rating, feedback);
    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.message === 'DUPLICATE_REVIEW') {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'This contract link has already been evaluated.' } });
    }
    throw error;
  }
};
