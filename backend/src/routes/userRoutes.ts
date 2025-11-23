import { Router } from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  getUserProfile,
  uploadAvatar,
  searchUsersHandler,
} from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';
import { uploadSingle } from '../middleware/uploadMiddleware';

const router = Router();

// Protected routes - require authentication
router.get('/me', authenticateToken, getCurrentUser);
router.patch('/me', authenticateToken, updateCurrentUser);
router.post('/me/avatar', authenticateToken, uploadSingle, uploadAvatar);

// Public routes
router.get('/search', searchUsersHandler); // Can be used with or without auth

// Public route - get user profile (with privacy checks)
router.get('/:userId', getUserProfile);

export default router;

