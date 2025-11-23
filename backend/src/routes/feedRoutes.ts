import { Router } from 'express';
import { getFeedHandler } from '../controllers/feedController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.get('/', authenticateToken, getFeedHandler);

export default router;

