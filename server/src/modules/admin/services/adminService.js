import User from '../../identity/models/User.js';
import ProjectRequirement from '../../marketplace/models/ProjectRequirement.js';
import Contract from '../../billing/models/Contract.js';

export const getDashboardStats = async () => {
  const [totalTrainers, totalCompanies, activeProjects, contracts, allProjects, unverifiedUsers] = await Promise.all([
    User.countDocuments({ role: 'TRAINER' }),
    User.countDocuments({ role: 'COMPANY' }),
    ProjectRequirement.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
    Contract.find({}).lean(),
    ProjectRequirement.find({}).select('tags requiredSkills').lean(),
    User.find({ isEmailVerified: false }).select('email role isEmailVerified').limit(10).lean()
  ]);

  let totalTransactions = 0;
  const platformVolumeMap = new Map();

  contracts.forEach(contract => {
    // Only count released milestones for actual transactions, or total contract value?
    // Let's count total contract value for platform volume
    totalTransactions += contract.totalContractValue || 0;
    
    const month = new Date(contract.createdAt).toLocaleString('default', { month: 'short' });
    const current = platformVolumeMap.get(month) || 0;
    platformVolumeMap.set(month, current + (contract.totalContractValue || 0));
  });

  const platformVolume = Array.from(platformVolumeMap, ([month, volume]) => ({ month, volume }));
  // Fill missing months for a nice chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const finalVolume = months.map(m => ({
    month: m,
    volume: platformVolumeMap.get(m) || 0
  }));

  // Dynamically calculate category breakdown based on tags and skills
  const tagCounts = new Map();
  allProjects.forEach(proj => {
    const skills = [...(proj.tags || []), ...(proj.requiredSkills || [])];
    skills.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      tagCounts.set(lowerSkill, (tagCounts.get(lowerSkill) || 0) + 1);
    });
  });

  const sortedTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1]);

  const topTags = sortedTags.slice(0, 4);
  const otherCount = sortedTags.slice(4).reduce((sum, [_, count]) => sum + count, 0);

  const totalTags = sortedTags.reduce((sum, [_, count]) => sum + count, 0);
  
  let categoryBreakdown = [];
  if (totalTags > 0) {
    categoryBreakdown = topTags.map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round((count / totalTags) * 100)
    }));
    if (otherCount > 0) {
      categoryBreakdown.push({
        name: "Other",
        value: Math.round((otherCount / totalTags) * 100)
      });
    }
  }

  // Pending Verifications
  const pendingVerifs = unverifiedUsers.map(u => ({
    id: u._id,
    name: u.email,
    type: u.role,
    docs: ['Email Verification Pending']
  }));

  return {
    totalTrainers,
    totalCompanies,
    activeProjects,
    totalTransactions,
    disputesOpen: 0,
    pendingVerifications: unverifiedUsers.length,
    platformVolume: finalVolume,
    categoryBreakdown,
    recentDisputes: [], // No disputes module in MVP yet
    pendingVerifs
  };
};

export const getAllUsers = async () => {
  const users = await User.find({ role: { $in: ['TRAINER', 'COMPANY'] } })
    .select('email role isEmailVerified accountStatus createdAt')
    .lean();
    
  // Map it to frontend format
  return users.map(u => ({
    id: u._id.toString(),
    name: u.email.split('@')[0],
    email: u.email,
    type: u.role.toLowerCase(),
    verified: u.isEmailVerified,
    rating: (Math.random() * 2 + 3).toFixed(1), // Mock rating since we don't have reviews yet
    projects: Math.floor(Math.random() * 20), // Mock projects count
    status: u.accountStatus ? u.accountStatus.toLowerCase() : 'active',
    joined: new Date(u.createdAt).toLocaleDateString('default', { month: 'short', year: 'numeric' }),
    skills: []
  }));
};

export const verifyUser = async (userId) => {
  const user = await User.findByIdAndUpdate(userId, { isEmailVerified: true, isOnboarded: true }, { new: true });
  if (!user) throw new Error("User not found");
  return user;
};

export const updateUserStatus = async (userId, status) => {
  const user = await User.findByIdAndUpdate(userId, { accountStatus: status }, { new: true });
  if (!user) throw new Error("User not found");
  return user;
};

export const getDisputes = async () => {
  const disputes = await Contract.find({ status: 'DISPUTED' })
    .populate('trainerId', 'email')
    .populate('companyId', 'email')
    .lean();

  return disputes.map(d => {
    // Calculate days open (mocking created at if missing)
    const msInDay = 1000 * 60 * 60 * 24;
    const daysOpen = Math.floor((new Date() - new Date(d.updatedAt || d.createdAt)) / msInDay) || 1;
    
    return {
      id: d._id.toString(),
      trainer: d.trainerId?.email ? d.trainerId.email.split('@')[0] : 'Unknown Trainer',
      company: d.companyId?.email ? d.companyId.email.split('@')[0] : 'Unknown Company',
      issue: "Escrow delivery dispute",
      days: daysOpen,
      amount: d.totalContractValue || 0,
      status: 'reviewing' // Frontend maps this to 'Under Review'
    };
  });
};

export const reopenDispute = async (contractId) => {
  const contract = await Contract.findByIdAndUpdate(contractId, { status: 'ACTIVE' }, { new: true });
  if (!contract) throw new Error("Contract not found");
  return contract;
};

export const forceReleaseFunds = async (contractId) => {
  const contract = await Contract.findById(contractId);
  if (!contract) throw new Error("Contract not found");
  
  contract.status = 'COMPLETED';
  contract.milestones.forEach(m => {
    if (m.status === 'FUNDED' || m.status === 'IN_REVIEW') {
      m.status = 'RELEASED';
    }
  });
  
  await contract.save();
  return contract;
};
