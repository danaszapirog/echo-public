import { Router } from 'express';
import {
  createWantToGoHandler,
  getWantToGoListHandler,
  getWantToGoHandler,
  updateWantToGoHandler,
  deleteWantToGoHandler,
  convertToSpotHandler,
} from '../controllers/wantToGoController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.post('/', authenticateToken, createWantToGoHandler);
router.get('/', authenticateToken, getWantToGoListHandler);
router.get('/:wantToGoId', authenticateToken, getWantToGoHandler);
router.patch('/:wantToGoId', authenticateToken, updateWantToGoHandler);
router.delete('/:wantToGoId', authenticateToken, deleteWantToGoHandler);
router.post('/:wantToGoId/convert-to-spot', authenticateToken, convertToSpotHandler);

export default router;

