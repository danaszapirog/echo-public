import { prisma } from '../config/prisma';

/**
 * Get feed items for a user
 */
export async function getFeedItems(
  userId: string,
  limit: number = 20,
  cursor?: string
) {
  const where: any = {
    userId,
  };

  // Cursor-based pagination using createdAt
  if (cursor) {
    const cursorDate = new Date(cursor);
    where.createdAt = {
      lt: cursorDate,
    };
  }

  const feedItems = await prisma.feedItem.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          username: true,
          profilePictureUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit + 1, // Fetch one extra to check if there are more
  });

  const hasMore = feedItems.length > limit;
  const items = hasMore ? feedItems.slice(0, limit) : feedItems;

  // Fetch content for each feed item
  const feedItemsWithContent = await Promise.all(
    items.map(async (item) => {
      if (item.contentType === 'playlist') {
        const playlist = await prisma.playlist.findUnique({
          where: { id: item.contentId },
          include: {
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
        });

        if (!playlist) {
          return null;
        }

        return {
          type: 'playlist',
          id: item.id,
          playlist: {
            id: playlist.id,
            title: playlist.title,
            description: playlist.description,
            cover_image_url: playlist.coverImageUrl,
            spot_count: playlist._count.spots,
          },
          author: {
            id: item.author.id,
            username: item.author.username,
            profile_picture_url: item.author.profilePictureUrl,
          },
          created_at: item.createdAt,
        };
      } else if (item.contentType === 'spot') {
        const spot = await prisma.spot.findUnique({
          where: { id: item.contentId },
          include: {
            place: {
              select: {
                id: true,
                name: true,
                categories: true,
              },
            },
          },
        });

        if (!spot) {
          return null;
        }

        return {
          type: 'spot',
          id: item.id,
          spot: {
            id: spot.id,
            place: {
              name: spot.place.name,
              categories: spot.place.categories as string[],
            },
            rating: spot.rating,
            notes: spot.notes,
            tags: spot.tags,
            photos: spot.photos ? (spot.photos as string[]) : [],
          },
          author: {
            id: item.author.id,
            username: item.author.username,
            profile_picture_url: item.author.profilePictureUrl,
          },
          created_at: item.createdAt,
        };
      }

      return null;
    })
  );

  // Filter out null items (deleted content)
  const validItems = feedItemsWithContent.filter(
    (item) => item !== null
  ) as any[];

  const nextCursor =
    hasMore && validItems.length > 0
      ? validItems[validItems.length - 1].created_at.toISOString()
      : null;

  return {
    items: validItems,
    next_cursor: nextCursor,
    has_more: hasMore,
  };
}

/**
 * Generate feed items for followers when content is created
 * This is called synchronously for now (can be moved to background job later)
 */
export async function generateFeedItems(
  authorId: string,
  contentType: 'playlist' | 'spot',
  contentId: string
) {
  // Get all active followers of the author
  const followers = await prisma.follow.findMany({
    where: {
      followeeId: authorId,
      status: 'active',
    },
    select: {
      followerId: true,
    },
  });

  if (followers.length === 0) {
    return { created: 0 };
  }

  // Create feed items for all followers
  const feedItems = followers.map((follow) => ({
    userId: follow.followerId,
    contentType,
    contentId,
    authorId,
  }));

  // Batch insert feed items
  await prisma.feedItem.createMany({
    data: feedItems,
  });

  return { created: feedItems.length };
}

