import { Request, Response, NextFunction } from 'express';
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
import {
  createPlaylist,
  getPlaylistById,
  getPlaylists,
  updatePlaylist,
  deletePlaylist,
  publishPlaylist,
  unpublishPlaylist,
  addSpotToPlaylist,
  removeSpotFromPlaylist,
} from '../services/playlistService';
import { CustomError } from '../middleware/errorHandler';

// Mock the playlist service
jest.mock('../services/playlistService');

describe('Playlist Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const mockUser = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: 'consumer',
  };

  const mockPlaylist = {
    id: '223e4567-e89b-12d3-a456-426614174000',
    title: 'My Favorite Places',
    description: 'A collection of my favorite spots',
    coverImageUrl: 'https://example.com/cover.jpg',
    isPublished: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    publishedAt: null,
    user: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      profilePictureUrl: null,
    },
    spots: [
      {
        spot: {
          id: '323e4567-e89b-12d3-a456-426614174000',
          place: {
            id: '423e4567-e89b-12d3-a456-426614174000',
            name: 'Joe\'s Pizza',
            latitude: 40.7282,
            longitude: -73.9942,
            categories: ['Pizza Place'],
          },
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            username: 'testuser',
            profilePictureUrl: null,
          },
          rating: 5,
          notes: 'Great pizza!',
          tags: ['pizza', 'italian'],
          photos: null,
        },
        displayOrder: 0,
      },
    ],
  };

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: mockUser,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('createPlaylistHandler', () => {
    it('should create a playlist successfully', async () => {
      (createPlaylist as jest.Mock).mockResolvedValue(mockPlaylist);

      mockRequest.body = {
        title: 'My Favorite Places',
        description: 'A collection of my favorite spots',
        spot_ids: ['323e4567-e89b-12d3-a456-426614174000'],
      };

      await createPlaylistHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(createPlaylist).toHaveBeenCalledWith({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'My Favorite Places',
        description: 'A collection of my favorite spots',
        coverImageUrl: undefined,
        spotIds: ['323e4567-e89b-12d3-a456-426614174000'],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await createPlaylistHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized',
          statusCode: 401,
        })
      );
    });

    it('should return 400 for invalid input', async () => {
      mockRequest.body = {
        title: '', // Empty title
        spot_ids: ['invalid-uuid'], // Invalid UUID
      };

      await createPlaylistHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect((mockNext as jest.Mock).mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });

  describe('getPlaylistHandler', () => {
    it('should get a playlist successfully', async () => {
      (getPlaylistById as jest.Mock).mockResolvedValue(mockPlaylist);

      mockRequest.params = { playlistId: '223e4567-e89b-12d3-a456-426614174000' };

      await getPlaylistHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getPlaylistById).toHaveBeenCalledWith('223e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle playlist not found', async () => {
      const error = new CustomError('Playlist not found', 404);
      (getPlaylistById as jest.Mock).mockRejectedValue(error);

      mockRequest.params = { playlistId: 'non-existent' };

      await getPlaylistHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should work without authentication for published playlists', async () => {
      mockRequest.user = undefined;
      (getPlaylistById as jest.Mock).mockResolvedValue({
        ...mockPlaylist,
        isPublished: true,
      });

      mockRequest.params = { playlistId: '223e4567-e89b-12d3-a456-426614174000' };

      await getPlaylistHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getPlaylistById).toHaveBeenCalledWith('223e4567-e89b-12d3-a456-426614174000', undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('listPlaylistsHandler', () => {
    it('should list playlists successfully', async () => {
      const mockResult = {
        playlists: [
          {
            ...mockPlaylist,
            _count: {
              spots: 1,
            },
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      };
      (getPlaylists as jest.Mock).mockResolvedValue(mockResult);

      await listPlaylistsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getPlaylists).toHaveBeenCalledWith({
        userId: undefined,
        isPublished: undefined,
        limit: 20,
        offset: 0,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should filter by user_id', async () => {
      const mockResult = {
        playlists: [mockPlaylist],
        total: 1,
        limit: 20,
        offset: 0,
      };
      (getPlaylists as jest.Mock).mockResolvedValue(mockResult);

      mockRequest.query = { user_id: '123e4567-e89b-12d3-a456-426614174000' };

      await listPlaylistsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getPlaylists).toHaveBeenCalledWith({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        isPublished: undefined,
        limit: 20,
        offset: 0,
      });
    });

    it('should filter by is_published', async () => {
      const mockResult = {
        playlists: [mockPlaylist],
        total: 1,
        limit: 20,
        offset: 0,
      };
      (getPlaylists as jest.Mock).mockResolvedValue(mockResult);

      mockRequest.query = { is_published: 'true' };

      await listPlaylistsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getPlaylists).toHaveBeenCalledWith({
        userId: undefined,
        isPublished: true,
        limit: 20,
        offset: 0,
      });
    });

    it('should handle pagination', async () => {
      const mockResult = {
        playlists: [],
        total: 0,
        limit: 10,
        offset: 20,
      };
      (getPlaylists as jest.Mock).mockResolvedValue(mockResult);

      mockRequest.query = { limit: '10', offset: '20' };

      await listPlaylistsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getPlaylists).toHaveBeenCalledWith({
        userId: undefined,
        isPublished: undefined,
        limit: 10,
        offset: 20,
      });
    });
  });

  describe('updatePlaylistHandler', () => {
    it('should update a playlist successfully', async () => {
      const updatedPlaylist = {
        ...mockPlaylist,
        title: 'Updated Title',
        description: 'Updated description',
      };
      (updatePlaylist as jest.Mock).mockResolvedValue(updatedPlaylist);

      mockRequest.params = { playlistId: '223e4567-e89b-12d3-a456-426614174000' };
      mockRequest.body = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      await updatePlaylistHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(updatePlaylist).toHaveBeenCalledWith(
        '223e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174000',
        {
          title: 'Updated Title',
          description: 'Updated description',
          coverImageUrl: undefined,
        }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await updatePlaylistHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized',
          statusCode: 401,
        })
      );
    });

    it('should handle playlist not found', async () => {
      const error = new CustomError('Playlist not found', 404);
      (updatePlaylist as jest.Mock).mockRejectedValue(error);

      mockRequest.params = { playlistId: 'non-existent' };
      mockRequest.body = { title: 'New Title' };

      await updatePlaylistHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deletePlaylistHandler', () => {
    it('should delete a playlist successfully', async () => {
      (deletePlaylist as jest.Mock).mockResolvedValue({ success: true });

      mockRequest.params = { playlistId: '223e4567-e89b-12d3-a456-426614174000' };

      await deletePlaylistHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(deletePlaylist).toHaveBeenCalledWith('223e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await deletePlaylistHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized',
          statusCode: 401,
        })
      );
    });

    it('should handle permission denied', async () => {
      const error = new CustomError(
        'You do not have permission to delete this playlist',
        403
      );
      (deletePlaylist as jest.Mock).mockRejectedValue(error);

      mockRequest.params = { playlistId: '223e4567-e89b-12d3-a456-426614174000' };

      await deletePlaylistHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('publishPlaylistHandler', () => {
    it('should publish a playlist successfully', async () => {
      const publishedPlaylist = {
        ...mockPlaylist,
        isPublished: true,
        publishedAt: new Date(),
      };
      (publishPlaylist as jest.Mock).mockResolvedValue(publishedPlaylist);

      mockRequest.params = { playlistId: '223e4567-e89b-12d3-a456-426614174000' };

      await publishPlaylistHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(publishPlaylist).toHaveBeenCalledWith('223e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await publishPlaylistHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized',
          statusCode: 401,
        })
      );
    });

    it('should handle empty playlist error', async () => {
      const error = new CustomError(
        'Playlist must have at least one spot before publishing',
        400
      );
      (publishPlaylist as jest.Mock).mockRejectedValue(error);

      mockRequest.params = { playlistId: '223e4567-e89b-12d3-a456-426614174000' };

      await publishPlaylistHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('unpublishPlaylistHandler', () => {
    it('should unpublish a playlist successfully', async () => {
      const unpublishedPlaylist = {
        ...mockPlaylist,
        isPublished: false,
        publishedAt: null,
      };
      (unpublishPlaylist as jest.Mock).mockResolvedValue(unpublishedPlaylist);

      mockRequest.params = { playlistId: '223e4567-e89b-12d3-a456-426614174000' };

      await unpublishPlaylistHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(unpublishPlaylist).toHaveBeenCalledWith('223e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await unpublishPlaylistHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized',
          statusCode: 401,
        })
      );
    });
  });

  describe('addRemoveSpotHandler', () => {
    it('should add a spot to playlist successfully', async () => {
      const updatedPlaylist = {
        ...mockPlaylist,
        spots: [
          ...mockPlaylist.spots,
          {
            spot: {
            id: '523e4567-e89b-12d3-a456-426614174000',
            place: { id: '623e4567-e89b-12d3-a456-426614174000', name: 'New Place' },
            },
            displayOrder: 1,
          },
        ],
      };
      (addSpotToPlaylist as jest.Mock).mockResolvedValue(updatedPlaylist);

      mockRequest.params = { playlistId: '223e4567-e89b-12d3-a456-426614174000' };
      mockRequest.body = {
        action: 'add',
        spot_id: '523e4567-e89b-12d3-a456-426614174000',
      };

      await addRemoveSpotHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(addSpotToPlaylist).toHaveBeenCalledWith(
        '223e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174000',
        '523e4567-e89b-12d3-a456-426614174000',
        undefined
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should remove a spot from playlist successfully', async () => {
      const updatedPlaylist = {
        ...mockPlaylist,
        spots: [],
      };
      (removeSpotFromPlaylist as jest.Mock).mockResolvedValue(updatedPlaylist);

      mockRequest.params = { playlistId: '223e4567-e89b-12d3-a456-426614174000' };
      mockRequest.body = {
        action: 'remove',
        spot_id: '323e4567-e89b-12d3-a456-426614174000',
      };

      await addRemoveSpotHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(removeSpotFromPlaylist).toHaveBeenCalledWith(
        '223e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174000',
        '323e4567-e89b-12d3-a456-426614174000'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await addRemoveSpotHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized',
          statusCode: 401,
        })
      );
    });

    it('should handle invalid action', async () => {
      mockRequest.params = { playlistId: '223e4567-e89b-12d3-a456-426614174000' };
      mockRequest.body = {
        action: 'invalid',
        spot_id: '323e4567-e89b-12d3-a456-426614174000',
      };

      await addRemoveSpotHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect((mockNext as jest.Mock).mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });
});

