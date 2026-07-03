import * as workflowService from '../services/workflowService.js';


export const getApplications = async (req, res, next) => {
  try {
    const applications = await workflowService.getApplicationsByRole(req.user.userId, req.user.role);
    return res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

export const applyToProject = async (req, res, next) => {
  try {
    const { requirementId, bidAmount, proposedTimeline, coverLetter } = req.body;
    if (!requirementId || !bidAmount || !proposedTimeline || !coverLetter) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing parameters.' } });
    }

    const application = await workflowService.submitProposal(req.user.userId, requirementId, { bidAmount, proposedTimeline, coverLetter });
    return res.status(201).json({ success: true, data: application });
  } catch (error) {
    if (error.message === 'ALREADY_APPLIED') {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Proposal already submitted for this project.' } });
    }
    next(error);
  }
};

export const transitionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedApplication = await workflowService.updateApplicationStatus(id, status);
    return res.status(200).json({ success: true, data: updatedApplication });
  } catch (error) {
    if (error.message === 'APPLICATION_NOT_FOUND') {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application record missing.' } });
    }
    if (error.message === 'INVALID_STATE_TRANSITION') {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Violates core state pipeline direction guidelines.' } });
    }
    throw error;
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const NotificationModel = (await import('../models/Notification.js')).default;
    const notifications = await NotificationModel.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const NotificationModel = (await import('../models/Notification.js')).default;
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
    }
    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};
