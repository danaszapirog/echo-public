import { prisma } from '../config/prisma';
import { CustomError } from '../middleware/errorHandler';
import { generateFeedItems } from './feedService';

export interface CreatePlaylistData {
  userId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  spotIds?: string[];
}

export interface UpdatePlaylistData {
  title?: string;
  description?: string;
  coverImageUrl?: string;
}

/**
 * Create a new playlist
 */
export async function createPlaylist(data: CreatePlaylistData) {
  // Verify all spot IDs belong to the user
  if (data.spotIds && data.spotIds.length > 0) {
    const userSpots = await prisma.spot.findMany({
      where: {
        id: { in: data.spotIds },
        userId: data.userId,
      },
      select: { id: true },
    });

    const userSpotIds = new Set(userSpots.map((s) => s.id));
    const invalidSpots = data.spotIds.filter((id) => !userSpotIds.has(id));

    if (invalidSpots.length > 0) {
      throw new CustomError(
        `Spots do not belong to you: ${invalidSpots.join(', ')}`,
        403
      );
    }
  }

  // Create playlist with spots in a transaction
  const playlist = await prisma.$transaction(async (tx) => {
    // Create playlist
    const newPlaylist = await tx.playlist.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description || null,
        coverImageUrl: data.coverImageUrl || null,
        isPublished: false,
      },
    });

    // Add spots to playlist
    if (data.spotIds && data.spotIds.length > 0) {
      await tx.playlistSpot.createMany({
        data: data.spotIds.map((spotId, index) => ({
          playlistId: newPlaylist.id,
          spotId,
          displayOrder: index,
        })),
      });
    }

    // Fetch playlist with spots
    return tx.playlist.findUnique({
      where: { id: newPlaylist.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePictureUrl: true,
          },
        },
        spots: {
          include: {
            spot: {
              include: {
                place: true,
              },
            },
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });
  });

  if (!playlist) {
    throw new CustomError('Failed to create playlist', 500);
  }

  return playlist;
}

/**
 * Get playlist by ID
 */
export async function getPlaylistById(playlistId: string, userId?: string) {
  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePictureUrl: true,
          isPrivate: true,
        },
      },
      spots: {
        include: {
          spot: {
            include: {
              place: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  profilePictureUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          displayOrder: 'asc',
        },
      },
    },
  });

  if (!playlist) {
    throw new CustomError('Playlist not found', 404);
  }

  // Check visibility
  const isOwner = userId === playlist.userId;
  const isPublished = playlist.isPublished;

  // If not published and not owner, don't show
  if (!isPublished && !isOwner) {
    throw new CustomError('Playlist not found', 404);
  }

  // TODO: Phase 5 - Check if user follows owner for private users
  // For now, if published, anyone can see it

  return playlist;
}

/**
 * Get playlists with filters
 */
export async function getPlaylists(filters: {
  userId?: string;
  isPublished?: boolean;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.isPublished !== undefined) {
    where.isPublished = filters.isPublished;
  }

  const limit = filters.limit || 20;
  const offset = filters.offset || 0;

  const [playlists, total] = await Promise.all([
    prisma.playlist.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePictureUrl: true,
          },
        },
        spots: {
          select: {
            spotId: true,
          },
        },
        _count: {
          select: {
            spots: true,
          },
        },
      },
      orderBy: [
        { isPublished: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    }),
    prisma.playlist.count({ where }),
  ]);

  return {
    playlists,
    total,
    limit,
    offset,
  };
}

/**
 * Update playlist
 */
export async function updatePlaylist(
  playlistId: string,
  userId: string,
  data: UpdatePlaylistData
) {
  // Check if playlist exists and belongs to user
  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
  });

  if (!playlist) {
    throw new CustomError('Playlist not found', 404);
  }

  if (playlist.userId !== userId) {
    throw new CustomError('You do not have permission to update this playlist', 403);
  }

  // Update playlist
  const updated = await prisma.playlist.update({
    where: { id: playlistId },
    data: {
      title: data.title,
      description: data.description !== undefined ? data.description : undefined,
      coverImageUrl: data.coverImageUrl,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePictureUrl: true,
        },
      },
      spots: {
        include: {
          spot: {
            include: {
              place: true,
            },
          },
        },
        orderBy: {
          displayOrder: 'asc',
        },
      },
    },
  });

  return updated;
}

/**
 * Delete playlist
 */
export async function deletePlaylist(playlistId: string, userId: string) {
  // Check if playlist exists and belongs to user
  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
  });

  if (!playlist) {
    throw new CustomError('Playlist not found', 404);
  }

  if (playlist.userId !== userId) {
    throw new CustomError('You do not have permission to delete this playlist', 403);
  }

  // Delete playlist (cascade will delete playlist_spots)
  await prisma.playlist.delete({
    where: { id: playlistId },
  });

  return { success: true };
}

/**
 * Publish playlist
 */
export async function publishPlaylist(playlistId: string, userId: string) {
  // Check if playlist exists and belongs to user
  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
    include: {
      spots: {
        select: {
          spotId: true,
        },
      },
    },
  });

  if (!playlist) {
    throw new CustomError('Playlist not found', 404);
  }

  if (playlist.userId !== userId) {
    throw new CustomError('You do not have permission to publish this playlist', 403);
  }

  // Verify playlist has at least one spot
  if (playlist.spots.length === 0) {
    throw new CustomError('Playlist must have at least one spot before publishing', 400);
  }

  // Publish playlist
  const published = await prisma.playlist.update({
    where: { id: playlistId },
    data: {
      isPublished: true,
      publishedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePictureUrl: true,
        },
      },
      spots: {
        include: {
          spot: {
            include: {
              place: true,
            },
          },
        },
        orderBy: {
          displayOrder: 'asc',
        },
      },
    },
  });

  // Generate feed items for followers (fire and forget)
  generateFeedItems(userId, 'playlist', playlistId).catch((error) => {
    // Log error but don't fail playlist publishing
    console.error('Failed to generate feed items for playlist:', error);
  });

  return published;
}

/**
 * Unpublish playlist
 */
export async function unpublishPlaylist(playlistId: string, userId: string) {
  // Check if playlist exists and belongs to user
  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
  });

  if (!playlist) {
    throw new CustomError('Playlist not found', 404);
  }

  if (playlist.userId !== userId) {
    throw new CustomError('You do not have permission to unpublish this playlist', 403);
  }

  // Unpublish playlist
  const unpublished = await prisma.playlist.update({
    where: { id: playlistId },
    data: {
      isPublished: false,
      publishedAt: null,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePictureUrl: true,
        },
      },
      spots: {
        include: {
          spot: {
            include: {
              place: true,
            },
          },
        },
        orderBy: {
          displayOrder: 'asc',
        },
      },
    },
  });

  return unpublished;
}

/**
 * Add spot to playlist
 */
export async function addSpotToPlaylist(
  playlistId: string,
  userId: string,
  spotId: string,
  displayOrder?: number
) {
  // Check if playlist exists and belongs to user
  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
  });

  if (!playlist) {
    throw new CustomError('Playlist not found', 404);
  }

  if (playlist.userId !== userId) {
    throw new CustomError('You do not have permission to modify this playlist', 403);
  }

  // Check if spot belongs to user
  const spot = await prisma.spot.findUnique({
    where: { id: spotId },
  });

  if (!spot) {
    throw new CustomError('Spot not found', 404);
  }

  if (spot.userId !== userId) {
    throw new CustomError('Spot does not belong to you', 403);
  }

  // Check if spot is already in playlist
  const existing = await prisma.playlistSpot.findUnique({
    where: {
      playlistId_spotId: {
        playlistId,
        spotId,
      },
    },
  });

  if (existing) {
    throw new CustomError('Spot is already in this playlist', 409);
  }

  // Determine display order
  let order = displayOrder;
  if (order === undefined) {
    const maxOrder = await prisma.playlistSpot.findFirst({
      where: { playlistId },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });
    order = maxOrder ? maxOrder.displayOrder + 1 : 0;
  }

  // Add spot to playlist
  await prisma.playlistSpot.create({
    data: {
      playlistId,
      spotId,
      displayOrder: order,
    },
  });

  // Return updated playlist
  return getPlaylistById(playlistId, userId);
}

/**
 * Remove spot from playlist
 */
export async function removeSpotFromPlaylist(
  playlistId: string,
  userId: string,
  spotId: string
) {
  // Check if playlist exists and belongs to user
  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
  });

  if (!playlist) {
    throw new CustomError('Playlist not found', 404);
  }

  if (playlist.userId !== userId) {
    throw new CustomError('You do not have permission to modify this playlist', 403);
  }

  // Remove spot from playlist
  await prisma.playlistSpot.delete({
    where: {
      playlistId_spotId: {
        playlistId,
        spotId,
      },
    },
  });

  // Return updated playlist
  return getPlaylistById(playlistId, userId);
}

