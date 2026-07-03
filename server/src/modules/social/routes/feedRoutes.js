import { Router } from 'express';
import * as feedController from '../controllers/feedController.js';
import { authenticateUser } from '../../identity/middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticateUser, feedController.getPosts);
router.post('/', authenticateUser, feedController.createPost);
router.post('/:id/like', authenticateUser, feedController.toggleLike);
router.post('/:id/report', authenticateUser, feedController.reportPost);
router.post('/:id/comment', authenticateUser, feedController.addComment);

export default router;
