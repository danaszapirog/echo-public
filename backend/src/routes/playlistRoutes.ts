import { Router } from 'express';
import {
  createPlaylistHandler,
  getPlaylistHandler,
  listPlaylistsHandler,
  updatePlaylistHandler,
  deletePlaylistHandler,
  publishPlaylistHandler,
  unpublishPlaylistHandler,
  addRemoveSpotHandler,
} from '../controllers/playlistController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', listPlaylistsHandler); // Can filter by user_id, is_published
router.get('/:playlistId', getPlaylistHandler); // Public if published

// Protected routes - require authentication
router.post('/', authenticateToken, createPlaylistHandler);
router.patch('/:playlistId', authenticateToken, updatePlaylistHandler);
router.delete('/:playlistId', authenticateToken, deletePlaylistHandler);
router.post('/:playlistId/publish', authenticateToken, publishPlaylistHandler);
router.post('/:playlistId/unpublish', authenticateToken, unpublishPlaylistHandler);
router.patch('/:playlistId/spots', authenticateToken, addRemoveSpotHandler);

export default router;

