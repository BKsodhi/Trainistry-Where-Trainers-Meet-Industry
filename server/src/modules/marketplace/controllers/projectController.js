import * as projectService from '../services/projectService.js';
import Contract from '../../billing/models/Contract.js';

export const postRequirement = async (req, res, next) => {
  try {
    const project = await projectService.createRequirement(req.user.userId, req.body);
    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const discoverProjects = async (req, res, next) => {
  try {
    const criteria = {
      q: req.query.q,
      skills: req.query.skills,
      mode: req.query.mode,
      city: req.query.city,
      budgetMin: req.query.budgetMin,
      budgetMax: req.query.budgetMax,
      companyId: req.query.companyId,
      ownerId: req.query.mine === 'true' ? req.user.userId : undefined
    };

    const searchData = await projectService.searchMarketplaceProjects(criteria);
    return res.status(200).json({
      success: true,
      data: searchData,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyStats = async (req, res, next) => {
  try {
    const companyId = req.user.userId;
    const activeProjects = await projectService.searchMarketplaceProjects({ companyId });
    
    const contracts = await Contract.find({ companyId });
    let totalSpent = 0;
    let totalHired = contracts.length;
    
    // Build dummy monthly chart for the MVP, or aggregate by month if contracts exist
    const spendChart = [
      { month: "Jan", spend: 0 },
      { month: "Feb", spend: 0 },
      { month: "Mar", spend: 0 },
      { month: "Apr", spend: 0 },
      { month: "May", spend: 0 },
      { month: "Jun", spend: 0 },
      { month: "Jul", spend: 0 },
      { month: "Aug", spend: 0 },
      { month: "Sep", spend: 0 },
      { month: "Oct", spend: 0 },
      { month: "Nov", spend: 0 },
      { month: "Dec", spend: 0 },
    ];

    contracts.forEach(c => {
      totalSpent += c.totalContractValue;
      const monthIdx = new Date(c.createdAt).getMonth();
      if (monthIdx >= 0 && monthIdx < 12) {
        spendChart[monthIdx].spend += c.totalContractValue;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        activeProjects: activeProjects.count,
        totalHired,
        totalSpent,
        spendChart
      }
    });
  } catch (error) {
    next(error);
  }
};
