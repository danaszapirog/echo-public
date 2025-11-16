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

export const getUserPublicProfile = async (
  userId: string,
  requestingUserId?: string
): Promise<UserProfile | null> => {
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

  // If user is private and not the requesting user, hide email
  if (user.isPrivate && user.id !== requestingUserId) {
    // Check if requesting user follows this user
    if (requestingUserId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followeeId: {
            followerId: requestingUserId,
            followeeId: userId,
          },
        },
      });

      // If not following, don't show profile
      if (!follow || follow.status !== 'active') {
        return null;
      }
    } else {
      // Not authenticated, don't show private profile
      return null;
    }
  }

  // Creators are always public
  if (user.role === 'creator') {
    return user;
  }

  return user;
};

