import * as adminService from '../services/adminService.js';

export const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const user = await adminService.verifyUser(req.params.id);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const changeUserStatus = async (req, res, next) => {
  try {
    const user = await adminService.updateUserStatus(req.params.id, req.body.status);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getDisputes = async (req, res, next) => {
  try {
    const disputes = await adminService.getDisputes();
    return res.status(200).json({ success: true, data: disputes });
  } catch (error) {
    next(error);
  }
};

export const reopenDispute = async (req, res, next) => {
  try {
    const contract = await adminService.reopenDispute(req.params.id);
    return res.status(200).json({ success: true, data: contract });
  } catch (error) {
    next(error);
  }
};

export const forceReleaseFunds = async (req, res, next) => {
  try {
    const contract = await adminService.forceReleaseFunds(req.params.id);
    return res.status(200).json({ success: true, data: contract });
  } catch (error) {
    next(error);
  }
};
