import { Router } from 'express';
import {
  getLaunchCreatorsHandler,
  completeOnboardingHandler,
} from '../controllers/onboardingController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Get launch creators (public endpoint, no auth required)
router.get('/creators', getLaunchCreatorsHandler);

// Complete onboarding (requires authentication)
router.post('/complete', authenticateToken, completeOnboardingHandler);

export default router;

