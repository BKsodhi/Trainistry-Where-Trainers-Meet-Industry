import { Router } from 'express';
import * as billingController from '../controllers/billingController.js';
import { authenticateUser, authorizeRoles } from '../../identity/middlewares/authMiddleware.js';

const router = Router();

router.get('/trainer/stats', authenticateUser, authorizeRoles('TRAINER'), billingController.getTrainerStats);
router.get('/contracts', authenticateUser, billingController.getContracts);
router.post('/contracts', authenticateUser, authorizeRoles('COMPANY'), billingController.createContract);
router.patch('/contracts/:id/milestones/:milestoneId/status', authenticateUser, billingController.transitionMilestone);

export default router;
