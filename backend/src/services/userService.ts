import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '../config/prisma';
import { UpdateUserInput } from '../validators/userValidator';
import { CustomError } from '../middleware/errorHandler';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  bio: string | null;
  profilePictureUrl: string | null;
  role: string;
  isVerified: boolean;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      bio: true,
      profilePictureUrl: true,
      role: true,
      isVerified: true,
      isPrivate: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

export const updateUser = async (
  userId: string,
  input: UpdateUserInput
): Promise<UserProfile> => {
  try {
    // Check username uniqueness if username is being updated
    if (input.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: input.username.trim(),
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new CustomError('Username already taken', 409);
      }
    }

    // Get current user to check role constraints
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!currentUser) {
      throw new CustomError('User not found', 404);
    }

    // Enforce creator public profile constraint
    const updateData: any = {};
    if (input.username) updateData.username = input.username.trim();
    if (input.bio !== undefined) updateData.bio = input.bio;
    if (input.profilePictureUrl !== undefined) updateData.profilePictureUrl = input.profilePictureUrl;
    
    // If user is a creator, ensure isPrivate is false
    if (currentUser.role === 'creator') {
      updateData.isPrivate = false;
    } else if (input.isPrivate !== undefined) {
      updateData.isPrivate = input.isPrivate;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        profilePictureUrl: true,
        role: true,
        isVerified: true,
        isPrivate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const field = error.meta?.target as string[];
        if (field?.includes('username')) {
          throw new CustomError('Username already taken', 409);
        }
      }
    }
    throw error;
  }
};

export interface UserPublicProfile extends Omit<UserProfile, 'email'> {
  email?: string; // Optional - hidden for private profiles
  followStatus?: 'active' | 'pending' | 'none';
  canViewContent: boolean;
}

export const getUserPublicProfile = async (
  userId: string,
  requestingUserId?: string
): Promise<UserPublicProfile | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      bio: true,
      profilePictureUrl: true,
      role: true,
      isVerified: true,
      isPrivate: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return null;
  }

  // Creators are always public
  if (user.role === 'creator') {
    return {
      ...user,
      followStatus: undefined,
      canViewContent: true,
    };
  }

  // If user is private and not the requesting user
  if (user.isPrivate && user.id !== requestingUserId) {
    if (requestingUserId) {
      // Check follow relationship
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followeeId: {
            followerId: requestingUserId,
            followeeId: userId,
          },
        },
      });

      if (follow && follow.status === 'active') {
        // Following: show full profile
        return {
          ...user,
          followStatus: 'active',
          canViewContent: true,
        };
      } else if (follow && follow.status === 'pending') {
        // Pending request: show limited profile
        const { email, ...userWithoutEmail } = user;
        return {
          ...userWithoutEmail,
          followStatus: 'pending',
          canViewContent: false,
        };
      } else {
        // Not following: show limited profile
        const { email, ...userWithoutEmail } = user;
        return {
          ...userWithoutEmail,
          followStatus: 'none',
          canViewContent: false,
        };
      }
    } else {
      // Not authenticated: don't show private profile
      return null;
    }
  }

  // Public user or viewing own profile
  let followStatus: 'active' | 'pending' | 'none' | undefined = undefined;
  if (requestingUserId && user.id !== requestingUserId) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followeeId: {
          followerId: requestingUserId,
          followeeId: userId,
        },
      },
    });
    followStatus = follow?.status === 'active' ? 'active' : follow?.status === 'pending' ? 'pending' : 'none';
  }

  return {
    ...user,
    followStatus,
    canViewContent: true,
  };
};

/**
 * Search users by username
 */
export const searchUsers = async (
  searchQuery: string,
  requestingUserId?: string,
  limit: number = 20,
  offset: number = 0
): Promise<{
  users: Array<{
    id: string;
    username: string;
    profilePictureUrl: string | null;
    role: string;
    isPrivate: boolean;
    isVerified: boolean;
  }>;
  total: number;
  limit: number;
  offset: number;
}> => {
  if (!searchQuery || searchQuery.trim().length === 0) {
    return {
      users: [],
      total: 0,
      limit,
      offset,
    };
  }

  const query = searchQuery.trim();

  // Build where clause
  const where: any = {
    username: {
      contains: query,
      mode: 'insensitive',
    },
  };

  // Get all matching users first
  const allUsers = await prisma.user.findMany({
    where,
    select: {
      id: true,
      username: true,
      profilePictureUrl: true,
      role: true,
      isPrivate: true,
      isVerified: true,
    },
  });

  // Filter out private users unless requesting user follows them
  let filteredUsers = allUsers;
  if (requestingUserId) {
    // Get all follows where requesting user is follower
    const follows = await prisma.follow.findMany({
      where: {
        followerId: requestingUserId,
        status: 'active',
      },
      select: {
        followeeId: true,
      },
    });

    const followedUserIds = new Set(follows.map((f) => f.followeeId));

    // Filter: show user if:
    // 1. User is public, OR
    // 2. User is creator (always public), OR
    // 3. Requesting user follows them, OR
    // 4. It's the requesting user themselves
    filteredUsers = allUsers.filter(
      (user) =>
        !user.isPrivate ||
        user.role === 'creator' ||
        followedUserIds.has(user.id) ||
        user.id === requestingUserId
    );
  } else {
    // Not authenticated: only show public users and creators
    filteredUsers = allUsers.filter(
      (user) => !user.isPrivate || user.role === 'creator'
    );
  }

  // Apply pagination
  const total = filteredUsers.length;
  const paginatedUsers = filteredUsers.slice(offset, offset + limit);

  return {
    users: paginatedUsers,
    total,
    limit,
    offset,
  };
};

