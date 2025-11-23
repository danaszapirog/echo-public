import { Router } from 'express';
import { getMyLocations, getMapPinsHandler } from '../controllers/mapController';
import { authenticateToken } from '../middleware/authMiddleware';
import { mapRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication and rate limiting
router.get('/my-locations', authenticateToken, mapRateLimiter, getMyLocations);
router.get('/pins', authenticateToken, mapRateLimiter, getMapPinsHandler);

export default router;

