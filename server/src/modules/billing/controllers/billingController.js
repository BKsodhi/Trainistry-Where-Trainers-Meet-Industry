import * as billingService from '../services/billingService.js';
import Contract from '../models/Contract.js';

export const getContracts = async (req, res, next) => {
  try {
    const contracts = await billingService.getContractsByRole(req.user.userId, req.user.role);
    return res.status(200).json({ success: true, data: contracts });
  } catch (error) {
    next(error);
  }
};

export const createContract = async (req, res, next) => {
  try {
    const { applicationId, milestones } = req.body;
    if (!applicationId || !Array.isArray(milestones) || milestones.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid payload setup.' } });
    }

    const contract = await billingService.generateContractLedger(req.user.id, applicationId, milestones);
    return res.status(201).json({ success: true, data: contract });
  } catch (error) {
    if (error.message === 'APPLICATION_NOT_FOUND') {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application link missing.' } });
    }
    if (error.message === 'VIOLATES_WORKFLOW_RULES' || error.message === 'FINANCIAL_MISMATCH') {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: `Operational rejection: ${error.message}` } });
    }
    next(error);
  }
};

export const transitionMilestone = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    const { status } = req.body;

    const result = await billingService.updateMilestoneState(id, milestoneId, status);
    
    // MVP Hook: If milestone transitions to 'RELEASED', embed auto-generated mock tracking link
    let responsePayload = { ...result.milestone.toObject() };
    if (status === 'RELEASED') {
      responsePayload.invoiceGenerated = true;
      responsePayload.invoiceUrl = `https://res.cloudinary.com/trainistry/image/upload/v2026/invoices/inv_${id}_${milestoneId}.pdf`;
    }

    return res.status(200).json({ success: true, data: responsePayload });
  } catch (error) {
    if (error.message === 'CONTRACT_NOT_FOUND' || error.message === 'MILESTONE_NOT_FOUND') {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
    }
    next(error);
  }
};

export const getTrainerStats = async (req, res, next) => {
  try {
    const trainerId = req.user.id;
    const stats = await billingService.getTrainerFinancialStats(trainerId);
    
    return res.status(200).json({
      success: true,
      data: {
        totalEarned: stats.totalEarned,
        pendingPayments: stats.pendingPayments,
        activeProjects: stats.activeProjects,
        totalProjects: await Contract.countDocuments({ trainerId }),
        earningChart: stats.earningChart
      }
    });
  } catch (error) {
    next(error);
  }
};
