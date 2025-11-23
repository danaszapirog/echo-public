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
import { prisma } from '../config/prisma';
import { CustomError } from '../middleware/errorHandler';

// Mock Prisma
jest.mock('../config/prisma', () => ({
  prisma: {
    spot: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    playlist: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    playlistSpot: {
      create: jest.fn(),
      createMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('Playlist Service', () => {
  const mockUserId = 'user-123';
  const mockPlaylistId = 'playlist-123';
  const mockSpotId = 'spot-123';
  const mockPlaceId = 'place-123';

  const mockUser = {
    id: mockUserId,
    username: 'testuser',
    profilePictureUrl: null,
    isPrivate: false,
  };

  const mockPlace = {
    id: mockPlaceId,
    name: 'Joe\'s Pizza',
    latitude: 40.7282,
    longitude: -73.9942,
    categories: ['Pizza Place'],
  };

  const mockSpot = {
    id: mockSpotId,
    userId: mockUserId,
    placeId: mockPlaceId,
    rating: 5,
    notes: 'Great pizza!',
    tags: ['pizza'],
    photos: null,
    place: mockPlace,
    user: mockUser,
  };

  const mockPlaylist = {
    id: mockPlaylistId,
    userId: mockUserId,
    title: 'My Favorite Places',
    description: 'A collection of my favorite spots',
    coverImageUrl: null,
    isPublished: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    publishedAt: null,
    user: mockUser,
    spots: [
      {
        spot: {
          ...mockSpot,
          place: mockPlace,
        },
        displayOrder: 0,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPlaylist', () => {
    it('should create a playlist with spots successfully', async () => {
      const mockTransaction = jest.fn((callback) => callback({
        playlist: {
          create: jest.fn().mockResolvedValue(mockPlaylist),
          findUnique: jest.fn().mockResolvedValue(mockPlaylist),
        },
        playlistSpot: {
          createMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
      }));

      (prisma.$transaction as jest.Mock).mockImplementation(mockTransaction);
      (prisma.spot.findMany as jest.Mock).mockResolvedValue([{ id: mockSpotId }]);

      const result = await createPlaylist({
        userId: mockUserId,
        title: 'My Favorite Places',
        description: 'A collection',
        spotIds: [mockSpotId],
      });

      expect(prisma.spot.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: [mockSpotId] },
          userId: mockUserId,
        },
        select: { id: true },
      });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error if spot does not belong to user', async () => {
      (prisma.spot.findMany as jest.Mock).mockResolvedValue([]);

      await expect(
        createPlaylist({
          userId: mockUserId,
          title: 'My Playlist',
          spotIds: [mockSpotId],
        })
      ).rejects.toThrow(CustomError);

      expect(prisma.spot.findMany).toHaveBeenCalled();
    });

    it('should create playlist without spots', async () => {
      const mockTransaction = jest.fn((callback) => callback({
        playlist: {
          create: jest.fn().mockResolvedValue(mockPlaylist),
          findUnique: jest.fn().mockResolvedValue(mockPlaylist),
        },
        playlistSpot: {
          createMany: jest.fn(),
        },
      }));

      (prisma.$transaction as jest.Mock).mockImplementation(mockTransaction);

      const result = await createPlaylist({
        userId: mockUserId,
        title: 'Empty Playlist',
      });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getPlaylistById', () => {
    it('should get a published playlist successfully', async () => {
      const publishedPlaylist = {
        ...mockPlaylist,
        isPublished: true,
      };
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue(publishedPlaylist);

      const result = await getPlaylistById(mockPlaylistId);

      expect(prisma.playlist.findUnique).toHaveBeenCalledWith({
        where: { id: mockPlaylistId },
        include: expect.any(Object),
      });
      expect(result).toEqual(publishedPlaylist);
    });

    it('should allow owner to view unpublished playlist', async () => {
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue(mockPlaylist);

      const result = await getPlaylistById(mockPlaylistId, mockUserId);

      expect(result).toEqual(mockPlaylist);
    });

    it('should throw error for unpublished playlist accessed by non-owner', async () => {
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue(mockPlaylist);

      await expect(getPlaylistById(mockPlaylistId, 'other-user')).rejects.toThrow(
        CustomError
      );
    });

    it('should throw error if playlist not found', async () => {
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getPlaylistById('non-existent')).rejects.toThrow(CustomError);
    });
  });

  describe('getPlaylists', () => {
    it('should get playlists with filters', async () => {
      const mockPlaylists = [mockPlaylist];
      (prisma.playlist.findMany as jest.Mock).mockResolvedValue(mockPlaylists);
      (prisma.playlist.count as jest.Mock).mockResolvedValue(1);

      const result = await getPlaylists({
        userId: mockUserId,
        isPublished: true,
        limit: 20,
        offset: 0,
      });

      expect(prisma.playlist.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          isPublished: true,
        },
        include: expect.any(Object),
        orderBy: expect.any(Array),
        take: 20,
        skip: 0,
      });
      expect(result.playlists).toEqual(mockPlaylists);
      expect(result.total).toBe(1);
    });

    it('should use default pagination values', async () => {
      (prisma.playlist.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.playlist.count as jest.Mock).mockResolvedValue(0);

      const result = await getPlaylists({});

      expect(prisma.playlist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 0,
        })
      );
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });
  });

  describe('updatePlaylist', () => {
    it('should update a playlist successfully', async () => {
      const updatedPlaylist = {
        ...mockPlaylist,
        title: 'Updated Title',
      };
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue(mockPlaylist);
      (prisma.playlist.update as jest.Mock).mockResolvedValue(updatedPlaylist);

      const result = await updatePlaylist(mockPlaylistId, mockUserId, {
        title: 'Updated Title',
      });

      expect(prisma.playlist.findUnique).toHaveBeenCalledWith({
        where: { id: mockPlaylistId },
      });
      expect(prisma.playlist.update).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
    });

    it('should throw error if playlist not found', async () => {
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        updatePlaylist(mockPlaylistId, mockUserId, { title: 'New Title' })
      ).rejects.toThrow(CustomError);
    });

    it('should throw error if user is not owner', async () => {
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue(mockPlaylist);

      await expect(
        updatePlaylist(mockPlaylistId, 'other-user', { title: 'New Title' })
      ).rejects.toThrow(CustomError);
    });
  });

  describe('deletePlaylist', () => {
    it('should delete a playlist successfully', async () => {
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue(mockPlaylist);
      (prisma.playlist.delete as jest.Mock).mockResolvedValue(mockPlaylist);

      const result = await deletePlaylist(mockPlaylistId, mockUserId);

      expect(prisma.playlist.findUnique).toHaveBeenCalled();
      expect(prisma.playlist.delete).toHaveBeenCalledWith({
        where: { id: mockPlaylistId },
      });
      expect(result.success).toBe(true);
    });

    it('should throw error if playlist not found', async () => {
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(deletePlaylist(mockPlaylistId, mockUserId)).rejects.toThrow(
        CustomError
      );
    });

    it('should throw error if user is not owner', async () => {
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue(mockPlaylist);

      await expect(deletePlaylist(mockPlaylistId, 'other-user')).rejects.toThrow(
        CustomError
      );
    });
  });

  describe('publishPlaylist', () => {
    it('should publish a playlist successfully', async () => {
      const publishedPlaylist = {
        ...mockPlaylist,
        isPublished: true,
        publishedAt: new Date(),
        spots: [{ spotId: mockSpotId }],
      };
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue({
        ...mockPlaylist,
        spots: [{ spotId: mockSpotId }],
      });
      (prisma.playlist.update as jest.Mock).mockResolvedValue(publishedPlaylist);

      const result = await publishPlaylist(mockPlaylistId, mockUserId);

      expect(prisma.playlist.findUnique).toHaveBeenCalled();
      expect(prisma.playlist.update).toHaveBeenCalledWith({
        where: { id: mockPlaylistId },
        data: {
          isPublished: true,
          publishedAt: expect.any(Date),
        },
        include: expect.any(Object),
      });
      expect(result.isPublished).toBe(true);
    });

    it('should throw error if playlist has no spots', async () => {
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue({
        ...mockPlaylist,
        spots: [],
      });

      await expect(publishPlaylist(mockPlaylistId, mockUserId)).rejects.toThrow(
        CustomError
      );
    });

    it('should throw error if user is not owner', async () => {
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue({
        ...mockPlaylist,
        spots: [{ spotId: mockSpotId }],
      });

      await expect(publishPlaylist(mockPlaylistId, 'other-user')).rejects.toThrow(
        CustomError
      );
    });
  });

  describe('unpublishPlaylist', () => {
    it('should unpublish a playlist successfully', async () => {
      const unpublishedPlaylist = {
        ...mockPlaylist,
        isPublished: false,
        publishedAt: null,
      };
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue(mockPlaylist);
      (prisma.playlist.update as jest.Mock).mockResolvedValue(unpublishedPlaylist);

      const result = await unpublishPlaylist(mockPlaylistId, mockUserId);

      expect(prisma.playlist.update).toHaveBeenCalledWith({
        where: { id: mockPlaylistId },
        data: {
          isPublished: false,
          publishedAt: null,
        },
        include: expect.any(Object),
      });
      expect(result.isPublished).toBe(false);
    });

    it('should throw error if user is not owner', async () => {
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue(mockPlaylist);

      await expect(unpublishPlaylist(mockPlaylistId, 'other-user')).rejects.toThrow(
        CustomError
      );
    });
  });

  describe('addSpotToPlaylist', () => {
    it('should add a spot to playlist successfully', async () => {
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue(mockPlaylist);
      (prisma.spot.findUnique as jest.Mock).mockResolvedValue(mockSpot);
      (prisma.playlistSpot.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.playlistSpot.findFirst as jest.Mock).mockResolvedValue({
        displayOrder: 0,
      });
      (prisma.playlistSpot.create as jest.Mock).mockResolvedValue({});
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValueOnce(mockPlaylist)
        .mockResolvedValueOnce(mockPlaylist);

      const result = await addSpotToPlaylist(
        mockPlaylistId,
        mockUserId,
        mockSpotId
      );

      expect(prisma.playlist.findUnique).toHaveBeenCalled();
      expect(prisma.spot.findUnique).toHaveBeenCalled();
      expect(prisma.playlistSpot.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error if spot is already in playlist', async () => {
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue(mockPlaylist);
      (prisma.spot.findUnique as jest.Mock).mockResolvedValue(mockSpot);
      (prisma.playlistSpot.findUnique as jest.Mock).mockResolvedValue({
        playlistId: mockPlaylistId,
        spotId: mockSpotId,
      });

      await expect(
        addSpotToPlaylist(mockPlaylistId, mockUserId, mockSpotId)
      ).rejects.toThrow(CustomError);
    });

    it('should throw error if spot does not belong to user', async () => {
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue(mockPlaylist);
      (prisma.spot.findUnique as jest.Mock).mockResolvedValue({
        ...mockSpot,
        userId: 'other-user',
      });

      await expect(
        addSpotToPlaylist(mockPlaylistId, mockUserId, mockSpotId)
      ).rejects.toThrow(CustomError);
    });
  });

  describe('removeSpotFromPlaylist', () => {
    it('should remove a spot from playlist successfully', async () => {
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue(mockPlaylist);
      (prisma.playlistSpot.delete as jest.Mock).mockResolvedValue({});
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValueOnce(mockPlaylist)
        .mockResolvedValueOnce(mockPlaylist);

      const result = await removeSpotFromPlaylist(
        mockPlaylistId,
        mockUserId,
        mockSpotId
      );

      expect(prisma.playlist.findUnique).toHaveBeenCalled();
      expect(prisma.playlistSpot.delete).toHaveBeenCalledWith({
        where: {
          playlistId_spotId: {
            playlistId: mockPlaylistId,
            spotId: mockSpotId,
          },
        },
      });
      expect(result).toBeDefined();
    });

    it('should throw error if user is not owner', async () => {
      (prisma.playlist.findUnique as jest.Mock).mockResolvedValue(mockPlaylist);

      await expect(
        removeSpotFromPlaylist(mockPlaylistId, 'other-user', mockSpotId)
      ).rejects.toThrow(CustomError);
    });
  });
});

