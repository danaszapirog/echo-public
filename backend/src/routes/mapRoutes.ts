import { Router } from 'express';
import { getMyLocations } from '../controllers/mapController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.get('/my-locations', authenticateToken, getMyLocations);

export default router;

