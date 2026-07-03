import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = Router();

// Public Paths
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected Verification Self-Check Endpoint 
router.get('/me', authenticateUser, (req, res) => {
  return res.status(200).json({
    success: true,
    data: { user: req.user },
    meta: { timestamp: new Date().toISOString() }
  });
});

export default router;
