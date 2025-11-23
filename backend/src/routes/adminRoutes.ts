import { Router } from 'express';
import { makeCreatorHandler } from '../controllers/adminController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';

const router = Router();

// All admin routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// Make user a creator
router.post('/users/:userId/make-creator', makeCreatorHandler);

export default router;

