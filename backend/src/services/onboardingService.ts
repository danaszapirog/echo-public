import { prisma } from '../config/prisma';
import { CustomError } from '../middleware/errorHandler';

export interface CreatorProfile {
  id: string;
  username: string;
  bio: string | null;
  profile_picture_url: string | null;
  playlist_count: number;
  is_verified: boolean;
}

/**
 * Get launch creators (featured verified creators)
 */
export async function getLaunchCreators(): Promise<CreatorProfile[]> {
  // Get verified creators, optionally featured
  const creators = await prisma.user.findMany({
    where: {
      role: 'creator',
      isVerified: true,
      isPrivate: false, // Creators must be public
    },
    select: {
      id: true,
      username: true,
      bio: true,
      profilePictureUrl: true,
      isVerified: true,
      playlists: {
        where: {
          isPublished: true,
        },
        select: {
          id: true,
        },
      },
    },
    orderBy: [
      { isFeatured: 'desc' }, // Featured creators first
      { createdAt: 'asc' }, // Then by creation date (oldest first for consistency)
    ],
    take: 50, // Limit to top 50 creators
  });

  // Format response with playlist count
  return creators.map((creator) => ({
    id: creator.id,
    username: creator.username,
    bio: creator.bio,
    profile_picture_url: creator.profilePictureUrl,
    playlist_count: creator.playlists.length,
    is_verified: creator.isVerified,
  }));
}

/**
 * Complete onboarding by following creators
 */
export async function completeOnboarding(
  userId: string,
  followedCreatorIds: string[]
): Promise<void> {
  // Validate that all creator IDs are valid creators
  const creators = await prisma.user.findMany({
    where: {
      id: { in: followedCreatorIds },
      role: 'creator',
      isVerified: true,
    },
    select: {
      id: true,
    },
  });

  if (creators.length !== followedCreatorIds.length) {
    throw new CustomError(
      'One or more creator IDs are invalid',
      400
    );
  }

  // Prevent following yourself
  if (followedCreatorIds.includes(userId)) {
    throw new CustomError('Cannot follow yourself', 400);
  }

  // Use transaction to create all follows and update onboarding status
  await prisma.$transaction(async (tx) => {
    // Create follow relationships
    for (const creatorId of followedCreatorIds) {
      // Check if follow relationship already exists
      const existingFollow = await tx.follow.findUnique({
        where: {
          followerId_followeeId: {
            followerId: userId,
            followeeId: creatorId,
          },
        },
      });

      if (!existingFollow) {
        await tx.follow.create({
          data: {
            followerId: userId,
            followeeId: creatorId,
            status: 'active',
          },
        });
      }
    }

    // Mark onboarding as complete
    await tx.user.update({
      where: { id: userId },
      data: {
        onboardingCompletedAt: new Date(),
      } as any, // Type assertion needed until Prisma types are fully updated
    });
  });
}

