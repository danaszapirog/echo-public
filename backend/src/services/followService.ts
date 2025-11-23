import { prisma } from '../config/prisma';
import { CustomError } from '../middleware/errorHandler';

/**
 * Follow a user
 */
export async function followUser(followerId: string, followeeId: string) {
  // Cannot follow self
  if (followerId === followeeId) {
    throw new CustomError('Cannot follow yourself', 400);
  }

  // Check if followee exists
  const followee = await prisma.user.findUnique({
    where: { id: followeeId },
    select: {
      id: true,
      isPrivate: true,
      role: true,
    },
  });

  if (!followee) {
    throw new CustomError('User not found', 404);
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followeeId: {
        followerId,
        followeeId,
      },
    },
  });

  if (existingFollow) {
    // If already following with active status, return existing
    if (existingFollow.status === 'active') {
      return existingFollow;
    }
    // If pending, return existing
    if (existingFollow.status === 'pending') {
      return existingFollow;
    }
  }

  // Determine status based on followee's privacy settings
  // Creators are always public
  const isPublic = !followee.isPrivate || followee.role === 'creator';
  const status = isPublic ? 'active' : 'pending';

  // Create or update follow relationship
  const follow = await prisma.follow.upsert({
    where: {
      followerId_followeeId: {
        followerId,
        followeeId,
      },
    },
    update: {
      status,
    },
    create: {
      followerId,
      followeeId,
      status,
    },
  });

  return follow;
}

/**
 * Unfollow a user
 */
export async function unfollowUser(followerId: string, followId: string) {
  // Find the follow relationship
  const follow = await prisma.follow.findUnique({
    where: { id: followId },
  });

  if (!follow) {
    throw new CustomError('Follow relationship not found', 404);
  }

  // Verify the follower is the one trying to unfollow
  if (follow.followerId !== followerId) {
    throw new CustomError('You do not have permission to unfollow this user', 403);
  }

  // Delete the follow relationship
  await prisma.follow.delete({
    where: { id: followId },
  });

  return { success: true };
}

/**
 * Get follow relationship by IDs
 */
export async function getFollowById(followerId: string, followeeId: string) {
  return prisma.follow.findUnique({
    where: {
      followerId_followeeId: {
        followerId,
        followeeId,
      },
    },
  });
}

/**
 * Get pending follow requests for a user
 */
export async function getPendingFollowRequests(followeeId: string) {
  return prisma.follow.findMany({
    where: {
      followeeId,
      status: 'pending',
    },
    include: {
      follower: {
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
  });
}

/**
 * Approve a follow request
 */
export async function approveFollowRequest(
  followeeId: string,
  requestId: string
) {
  // Find the follow request
  const follow = await prisma.follow.findUnique({
    where: { id: requestId },
  });

  if (!follow) {
    throw new CustomError('Follow request not found', 404);
  }

  // Verify the followee is the one approving
  if (follow.followeeId !== followeeId) {
    throw new CustomError(
      'You do not have permission to approve this request',
      403
    );
  }

  // Verify it's a pending request
  if (follow.status !== 'pending') {
    throw new CustomError('This follow request is not pending', 400);
  }

  // Update status to active
  const updated = await prisma.follow.update({
    where: { id: requestId },
    data: {
      status: 'active',
    },
  });

  return updated;
}

/**
 * Deny a follow request
 */
export async function denyFollowRequest(followeeId: string, requestId: string) {
  // Find the follow request
  const follow = await prisma.follow.findUnique({
    where: { id: requestId },
  });

  if (!follow) {
    throw new CustomError('Follow request not found', 404);
  }

  // Verify the followee is the one denying
  if (follow.followeeId !== followeeId) {
    throw new CustomError(
      'You do not have permission to deny this request',
      403
    );
  }

  // Verify it's a pending request
  if (follow.status !== 'pending') {
    throw new CustomError('This follow request is not pending', 400);
  }

  // Delete the follow relationship
  await prisma.follow.delete({
    where: { id: requestId },
  });

  return { success: true };
}

