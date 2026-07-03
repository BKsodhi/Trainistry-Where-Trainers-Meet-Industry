import { Router } from 'express';
import * as workflowController from '../controllers/workflowController.js';
import { authenticateUser, authorizeRoles } from '../../identity/middlewares/authMiddleware.js';

const router = Router();

router.get('/applications', authenticateUser, workflowController.getApplications);
router.post('/apply', authenticateUser, authorizeRoles('TRAINER'), workflowController.applyToProject);
router.patch('/applications/:id/status', authenticateUser, authorizeRoles('COMPANY'), workflowController.transitionStatus);

router.get('/notifications', authenticateUser, workflowController.getNotifications);
router.patch('/notifications/:id/read', authenticateUser, workflowController.markNotificationRead);

export default router;
