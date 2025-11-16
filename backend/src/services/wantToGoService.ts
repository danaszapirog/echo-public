import { prisma } from '../config/prisma';
import { CustomError } from '../middleware/errorHandler';
import { createSpot, CreateSpotData } from './spotService';

export interface CreateWantToGoData {
  placeId: string;
  userId: string;
  notes?: string;
}

export interface UpdateWantToGoData {
  notes?: string;
}

/**
 * Create a new want-to-go item
 */
export async function createWantToGo(data: CreateWantToGoData) {
  // Check if place exists
  const place = await prisma.place.findUnique({
    where: { id: data.placeId },
  });

  if (!place) {
    throw new CustomError('Place not found', 404);
  }

  // Check if user already has a want-to-go for this place
  const existing = await prisma.wantToGo.findUnique({
    where: {
      userId_placeId: {
        userId: data.userId,
        placeId: data.placeId,
      },
    },
  });

  if (existing) {
    throw new CustomError('You already have this place in your Want to Go list', 409);
  }

  // Create the want-to-go item
  const wantToGo = await prisma.wantToGo.create({
    data: {
      userId: data.userId,
      placeId: data.placeId,
      notes: data.notes || null,
    },
    include: {
      place: true,
    },
  });

  return wantToGo;
}

/**
 * Get want-to-go by ID
 */
export async function getWantToGoById(wantToGoId: string) {
  const wantToGo = await prisma.wantToGo.findUnique({
    where: { id: wantToGoId },
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
  });

  if (!wantToGo) {
    throw new CustomError('Want to Go item not found', 404);
  }

  return wantToGo;
}

/**
 * Get user's want-to-go list
 */
export async function getUserWantToGoList(userId: string, limit: number = 50, offset: number = 0) {
  const [items, total] = await Promise.all([
    prisma.wantToGo.findMany({
      where: { userId },
      include: {
        place: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    }),
    prisma.wantToGo.count({
      where: { userId },
    }),
  ]);

  return {
    items,
    total,
    limit,
    offset,
  };
}

/**
 * Update a want-to-go item
 */
export async function updateWantToGo(wantToGoId: string, userId: string, data: UpdateWantToGoData) {
  // Check if want-to-go exists and belongs to user
  const wantToGo = await prisma.wantToGo.findUnique({
    where: { id: wantToGoId },
  });

  if (!wantToGo) {
    throw new CustomError('Want to Go item not found', 404);
  }

  if (wantToGo.userId !== userId) {
    throw new CustomError('You do not have permission to update this item', 403);
  }

  // Update the want-to-go item
  const updated = await prisma.wantToGo.update({
    where: { id: wantToGoId },
    data: {
      notes: data.notes !== undefined ? data.notes : undefined,
    },
    include: {
      place: true,
    },
  });

  return updated;
}

/**
 * Delete a want-to-go item
 */
export async function deleteWantToGo(wantToGoId: string, userId: string) {
  // Check if want-to-go exists and belongs to user
  const wantToGo = await prisma.wantToGo.findUnique({
    where: { id: wantToGoId },
  });

  if (!wantToGo) {
    throw new CustomError('Want to Go item not found', 404);
  }

  if (wantToGo.userId !== userId) {
    throw new CustomError('You do not have permission to delete this item', 403);
  }

  // Delete the want-to-go item
  await prisma.wantToGo.delete({
    where: { id: wantToGoId },
  });

  return { success: true };
}

/**
 * Get user's want-to-go for a specific place
 */
export async function getUserWantToGoForPlace(userId: string, placeId: string) {
  const wantToGo = await prisma.wantToGo.findUnique({
    where: {
      userId_placeId: {
        userId,
        placeId,
      },
    },
  });

  return wantToGo;
}

/**
 * Convert want-to-go to spot
 */
export async function convertWantToGoToSpot(
  wantToGoId: string,
  userId: string,
  spotData: {
    rating: number;
    notes?: string;
    tags?: string[];
    photos?: string[];
    guidedQuestions?: Record<string, any>;
  }
) {
  // Get the want-to-go item
  const wantToGo = await prisma.wantToGo.findUnique({
    where: { id: wantToGoId },
    include: {
      place: true,
    },
  });

  if (!wantToGo) {
    throw new CustomError('Want to Go item not found', 404);
  }

  if (wantToGo.userId !== userId) {
    throw new CustomError('You do not have permission to convert this item', 403);
  }

  // Check if user already has a spot for this place
  const existingSpot = await prisma.spot.findUnique({
    where: {
      userId_placeId: {
        userId,
        placeId: wantToGo.placeId,
      },
    },
  });

  if (existingSpot) {
    throw new CustomError('You already have a spot for this place', 409);
  }

  // Create the spot
  const createSpotData: CreateSpotData = {
    placeId: wantToGo.placeId,
    userId,
    rating: spotData.rating,
    notes: spotData.notes || wantToGo.notes || undefined,
    tags: spotData.tags,
    photos: spotData.photos,
    guidedQuestions: spotData.guidedQuestions,
  };

  const spot = await createSpot(createSpotData);

  // Delete the want-to-go item
  await prisma.wantToGo.delete({
    where: { id: wantToGoId },
  });

  return spot;
}

