import ProjectApplication from '../models/ProjectApplication.js';
import ProjectRequirement from '../../marketplace/models/ProjectRequirement.js';

export const submitProposal = async (trainerId, requirementId, payload) => {
  // Prevent duplicate applications by the same trainer for the same project
  const existingApplication = await ProjectApplication.findOne({ requirementId, trainerId });
  if (existingApplication) throw new Error('ALREADY_APPLIED');

  return await ProjectApplication.create({
    requirementId,
    trainerId,
    ...payload
  });
};

import { dispatchNotification } from './notificationService.js';

export const updateApplicationStatus = async (applicationId, targetStatus) => {
  const application = await ProjectApplication.findById(applicationId).populate('requirementId', 'title');
  if (!application) throw new Error('APPLICATION_NOT_FOUND');

  // Define strict state machine directional rules
  const validTransitions = {
    'APPLIED': ['SHORTLISTED', 'REJECTED'],
    'SHORTLISTED': ['INTERVIEWING', 'REJECTED', 'APPLIED'],
    'INTERVIEWING': ['OFFERED', 'REJECTED'],
    'OFFERED': ['ACCEPTED', 'REJECTED']
  };

  const currentStatus = application.status;
  if (currentStatus !== 'ACCEPTED' && currentStatus !== 'REJECTED') {
    if (validTransitions[currentStatus] && !validTransitions[currentStatus].includes(targetStatus)) {
      throw new Error('INVALID_STATE_TRANSITION');
    }
  }

  application.status = targetStatus;
  await application.save();

  // Dispatch Notification
  let message = `Your application for ${application.requirementId.title} has been updated to ${targetStatus}.`;
  if (targetStatus === 'SHORTLISTED') message = `Great news! Your application for ${application.requirementId.title} has been shortlisted.`;
  else if (targetStatus === 'INTERVIEWING') message = `An interview has been requested for ${application.requirementId.title}.`;
  else if (targetStatus === 'OFFERED') message = `You have received a formal offer for ${application.requirementId.title}!`;
  else if (targetStatus === 'REJECTED') message = `Your application for ${application.requirementId.title} was not selected at this time.`;

  await dispatchNotification({
    userId: application.trainerId,
    title: 'Application Status Update',
    message,
    actionLink: '/trainer/applications'
  });

  return application;
};

export const getApplicationsByRole = async (userId, role) => {
  if (role === 'TRAINER') {
    return await ProjectApplication.find({ trainerId: userId })
      .populate({
        path: 'requirementId',
        select: 'title companyId',
        populate: { path: 'companyId', select: 'email role' }
      })
      .sort({ createdAt: -1 });
  } else if (role === 'COMPANY') {
    const requirements = await ProjectRequirement.find({ companyId: userId }).select('_id title');
    const requirementIds = requirements.map(r => r._id);
    const applications = await ProjectApplication.find({ requirementId: { $in: requirementIds } }).sort({ createdAt: -1 });
    
    // Hydrate applications with Trainer Profile names inline
    const mongoose = (await import('mongoose')).default;
    const TrainerProfile = mongoose.model('TrainerProfile');
    
    const hydratedApplications = await Promise.all(applications.map(async (app) => {
      const profile = await TrainerProfile.findOne({ userId: app.trainerId }, 'fullName');
      const project = requirements.find(p => p._id.toString() === app.requirementId.toString());
      
      return {
        ...app.toObject(),
        trainerName: profile ? profile.fullName : 'Verified Corporate Trainer',
        projectTitle: project ? project.title : 'Training Engagement'
      };
    }));
    return hydratedApplications;
  }
};
