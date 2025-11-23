import { Router } from 'express';
import {
  followUserHandler,
  unfollowUserHandler,
  getFollowRequestsHandler,
  approveFollowRequestHandler,
  denyFollowRequestHandler,
} from '../controllers/followController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.post('/', authenticateToken, followUserHandler);
router.delete('/:followId', authenticateToken, unfollowUserHandler);
router.get('/requests', authenticateToken, getFollowRequestsHandler);
router.post('/requests/:requestId/approve', authenticateToken, approveFollowRequestHandler);
router.post('/requests/:requestId/deny', authenticateToken, denyFollowRequestHandler);

export default router;

