import mongoose from 'mongoose';
import Contract from '../models/Contract.js';
import ProjectApplication from '../../workflow/models/ProjectApplication.js';

export const generateContractLedger = async (companyId, applicationId, milestonesPayload) => {
  const session = await mongoose.startSession();
  let initializedContract = null;

  try {
    await session.withTransaction(async () => {
      // 1. Fetch, lock, and assert current application status
      const application = await ProjectApplication.findById(applicationId).session(session);
      if (!application) throw new Error('APPLICATION_NOT_FOUND');
      if (application.status !== 'OFFERED') throw new Error('VIOLATES_WORKFLOW_RULES');

      // 2. Compute financial total check match
      const computedTotal = milestonesPayload.reduce((sum, m) => sum + m.amount, 0);
      if (computedTotal !== application.bidAmount) throw new Error('FINANCIAL_MISMATCH');

      // 3. Mutate internal pipeline workflow state
      application.status = 'ACCEPTED';
      await application.save({ session });

      // 4. Instantiate the system contract document
      const contractPayload = {
        requirementId: application.requirementId,
        applicationId: application._id,
        companyId,
        trainerId: application.trainerId,
        totalContractValue: computedTotal,
        status: 'PENDING',
        milestones: milestonesPayload.map(m => ({ ...m, status: 'PENDING' }))
      };

      const newContracts = await Contract.create([contractPayload], { session });
      initializedContract = newContracts[0];
    });

    return initializedContract;
  } catch (error) {
    console.error('[TRANSACTION_ABORTED] Contract creation failed. Rollback complete.', error.message);
    throw error;
  } finally {
    await session.endSession();
  }
};

export const updateMilestoneState = async (contractId, milestoneId, targetStatus) => {
  const contract = await Contract.findById(contractId);
  if (!contract) throw new Error('CONTRACT_NOT_FOUND');

  const milestone = contract.milestones.id(milestoneId);
  if (!milestone) throw new Error('MILESTONE_NOT_FOUND');

  // Enforce manual milestone workflow transitions
  milestone.status = targetStatus;

  // Auto-activate contract lifecycle upon primary milestone funding verification
  if (targetStatus === 'FUNDED' && contract.status === 'PENDING') {
    contract.status = 'ACTIVE';
  }

  // Check if all milestones are offline-settled/released to complete the contract
  const allReleased = contract.milestones.every(m => m.status === 'RELEASED');
  if (allReleased) {
    contract.status = 'COMPLETED';
  }

  await contract.save();
  return { contract, milestone };
};

export const getContractsByRole = async (userId, role) => {
  if (role === 'TRAINER') {
    return await Contract.find({ trainerId: userId })
      .populate({ path: 'companyId', model: 'User', select: 'email' })
      .populate({ path: 'requirementId', model: 'ProjectRequirement', select: 'title' })
      .sort({ createdAt: -1 });
  } else if (role === 'COMPANY') {
    return await Contract.find({ companyId: userId })
      .populate({ path: 'trainerId', model: 'User', select: 'email' })
      .populate({ path: 'requirementId', model: 'ProjectRequirement', select: 'title' })
      .sort({ createdAt: -1 });
  }
  return [];
};

export const getTrainerFinancialStats = async (trainerId) => {
  const contracts = await Contract.find({ trainerId });
  
  let totalEarned = 0;
  let pendingPayments = 0;
  let activeProjects = 0;
  
  const earningChart = [
    { month: "Jan", earnings: 0 },
    { month: "Feb", earnings: 0 },
    { month: "Mar", earnings: 0 },
    { month: "Apr", earnings: 0 },
    { month: "May", earnings: 0 },
    { month: "Jun", earnings: 0 },
    { month: "Jul", earnings: 0 },
    { month: "Aug", earnings: 0 },
    { month: "Sep", earnings: 0 },
    { month: "Oct", earnings: 0 },
    { month: "Nov", earnings: 0 },
    { month: "Dec", earnings: 0 },
  ];

  contracts.forEach(contract => {
    if (contract.status === 'ACTIVE') activeProjects += 1;
    
    contract.milestones.forEach(m => {
      if (m.status === 'RELEASED') {
        totalEarned += m.amount;
        const monthIdx = new Date(contract.createdAt).getMonth(); 
        if (monthIdx >= 0 && monthIdx < 12) {
          earningChart[monthIdx].earnings += m.amount;
        }
      }
      if (m.status === 'FUNDED' || m.status === 'IN_REVIEW') pendingPayments += m.amount;
    });
  });

  return { totalEarned, pendingPayments, activeProjects, earningChart };
};
