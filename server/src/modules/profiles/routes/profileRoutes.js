import { Router } from 'express';
import * as profileController from '../controllers/profileController.js';
import { authenticateUser, authorizeRoles } from '../../identity/middlewares/authMiddleware.js';

const router = Router();

router.get('/trainer/me', authenticateUser, authorizeRoles('TRAINER'), profileController.getTrainerProfile);
router.put('/trainer', authenticateUser, authorizeRoles('TRAINER'), profileController.saveTrainerProfile);
router.post('/trainer/achievements', authenticateUser, authorizeRoles('TRAINER'), profileController.postAchievement);
router.post('/trainer/portfolio', authenticateUser, authorizeRoles('TRAINER'), profileController.postPortfolio);
router.post('/trainer/certifications', authenticateUser, authorizeRoles('TRAINER'), profileController.postCertification);
router.post('/reviews', authenticateUser, authorizeRoles('TRAINER', 'COMPANY'), profileController.submitReview);

export default router;
