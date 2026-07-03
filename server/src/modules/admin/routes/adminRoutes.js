import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticateUser } from '../../identity/middlewares/authMiddleware.js';

const router = Router();

// In a real app, you would add an authorizeAdmin middleware here
router.get('/stats', authenticateUser, adminController.getStats);
router.get('/users', authenticateUser, adminController.getUsers);
router.post('/users/:id/verify', authenticateUser, adminController.verifyUser);
router.post('/users/:id/status', authenticateUser, adminController.changeUserStatus);
router.get('/disputes', authenticateUser, adminController.getDisputes);
router.post('/disputes/:id/reopen', authenticateUser, adminController.reopenDispute);
router.post('/disputes/:id/release', authenticateUser, adminController.forceReleaseFunds);

export default router;
