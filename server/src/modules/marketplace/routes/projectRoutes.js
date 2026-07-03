import { Router } from 'express';
import * as projectController from '../controllers/projectController.js';
import { authenticateUser, authorizeRoles } from '../../identity/middlewares/authMiddleware.js';

const router = Router();

router.post('/projects', authenticateUser, authorizeRoles('COMPANY'), projectController.postRequirement);
router.get('/company/stats', authenticateUser, authorizeRoles('COMPANY'), projectController.getCompanyStats);
router.get('/search', authenticateUser, projectController.discoverProjects);

export default router;
