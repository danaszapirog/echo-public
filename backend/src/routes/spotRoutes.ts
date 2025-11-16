import { Router } from 'express';
import {
  createSpotHandler,
  getSpotHandler,
  updateSpotHandler,
  deleteSpotHandler,
} from '../controllers/spotController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.post('/', authenticateToken, createSpotHandler);
router.get('/:spotId', getSpotHandler); // Public endpoint
router.patch('/:spotId', authenticateToken, updateSpotHandler);
router.delete('/:spotId', authenticateToken, deleteSpotHandler);

export default router;

