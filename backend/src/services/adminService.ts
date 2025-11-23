import { prisma } from '../config/prisma';
import { CustomError } from '../middleware/errorHandler';

/**
 * Make a user a creator (admin only)
 */
export async function makeUserCreator(userId: string): Promise<void> {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      isVerified: true,
      isPrivate: true,
    },
  });

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  if (user.role === 'creator') {
    throw new CustomError('User is already a creator', 400);
  }

  // Update user to creator with verification
  // Enforce public profile for creators
  await prisma.user.update({
    where: { id: userId },
    data: {
      role: 'creator',
      isVerified: true,
      isPrivate: false, // Creators must be public
    },
  });

  // Note: Audit logging could be added here in the future
  // For now, we'll rely on database update timestamps
}

