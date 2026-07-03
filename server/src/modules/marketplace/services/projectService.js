import ProjectRequirement from '../models/ProjectRequirement.js';

export const createRequirement = async (companyId, projectPayload) => {
  return await ProjectRequirement.create({
    companyId,
    ...projectPayload
  });
};

export const searchMarketplaceProjects = async (filters) => {
  const query = { status: 'OPEN' };
  
  if (filters.companyId) query.companyId = filters.companyId;
  if (filters.ownerId) query.companyId = filters.ownerId;

  // 1. Text Search Vector over Title/Description
  if (filters.q) {
    query.$or = [
      { title: { $regex: filters.q, $options: 'i' } },
      { description: { $regex: filters.q, $options: 'i' } }
    ];
  }

  // 2. Strict Technical Skill Tag Array Matching
  if (filters.skills) {
    const skillArray = filters.skills.split(',').map(s => s.trim().toLowerCase());
    query.requiredSkills = { $in: skillArray };
  }

  // 3. Operational Mode & Location Constraints
  if (filters.mode) query.mode = filters.mode;
  if (filters.city) {
    query.location = { $regex: filters.city, $options: 'i' };
  }

  // 4. Financial Scale Ranges
  if (filters.budgetMin || filters.budgetMax) {
    query.budgetMax = {};
    if (filters.budgetMin) query.budgetMax.$gte = Number(filters.budgetMin);
    if (filters.budgetMax) query.budgetMax.$lte = Number(filters.budgetMax);
  }

  // Execute query limited to indexed fields
  const results = await ProjectRequirement.find(query).sort({ createdAt: -1 });
  return {
    results,
    count: results.length
  };
};
