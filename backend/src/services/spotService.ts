import { prisma } from '../config/prisma';
import { CustomError } from '../middleware/errorHandler';
import { validateQuestionIds } from './guidedQuestionsService';
import { generateFeedItems } from './feedService';

export interface CreateSpotData {
  placeId: string;
  userId: string;
  rating: number;
  notes?: string;
  tags?: string[];
  photos?: string[];
  guidedQuestions?: Record<string, any>;
}

export interface UpdateSpotData {
  rating?: number;
  notes?: string;
  tags?: string[];
  photos?: string[];
  guidedQuestions?: Record<string, any>;
}

/**
 * Create a new spot
 */
export async function createSpot(data: CreateSpotData) {
  // Check if place exists
  const place = await prisma.place.findUnique({
    where: { id: data.placeId },
  });

  if (!place) {
    throw new CustomError('Place not found', 404);
  }

  // Check if user already has a spot for this place
  const existingSpot = await prisma.spot.findUnique({
    where: {
      userId_placeId: {
        userId: data.userId,
        placeId: data.placeId,
      },
    },
  });

  if (existingSpot) {
    throw new CustomError('You already have a spot for this place', 409);
  }

  // Validate guided questions if provided
  if (data.guidedQuestions) {
    const questionIds = Object.keys(data.guidedQuestions);
    const isValid = await validateQuestionIds(questionIds);
    if (!isValid) {
      throw new CustomError('Invalid question IDs in guided_questions', 400);
    }
  }

  // Validate photos array length
  if (data.photos && data.photos.length > 5) {
    throw new CustomError('Maximum 5 photos allowed per spot', 400);
  }

  // Create the spot
  const spot = await prisma.spot.create({
    data: {
      userId: data.userId,
      placeId: data.placeId,
      rating: data.rating,
      notes: data.notes || null,
      tags: data.tags || [],
      photos: data.photos ? (data.photos as any) : null,
      guidedQuestions: data.guidedQuestions ? (data.guidedQuestions as any) : null,
    },
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

  // Generate feed items for followers (fire and forget)
  generateFeedItems(data.userId, 'spot', spot.id).catch((error) => {
    // Log error but don't fail spot creation
    console.error('Failed to generate feed items for spot:', error);
  });

  return spot;
}

/**
 * Get spot by ID
 */
export async function getSpotById(spotId: string) {
  const spot = await prisma.spot.findUnique({
    where: { id: spotId },
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

  if (!spot) {
    throw new CustomError('Spot not found', 404);
  }

  return spot;
}

/**
 * Update a spot
 */
export async function updateSpot(spotId: string, userId: string, data: UpdateSpotData) {
  // Check if spot exists and belongs to user
  const spot = await prisma.spot.findUnique({
    where: { id: spotId },
  });

  if (!spot) {
    throw new CustomError('Spot not found', 404);
  }

  if (spot.userId !== userId) {
    throw new CustomError('You do not have permission to update this spot', 403);
  }

  // Validate guided questions if provided
  if (data.guidedQuestions) {
    const questionIds = Object.keys(data.guidedQuestions);
    const isValid = await validateQuestionIds(questionIds);
    if (!isValid) {
      throw new CustomError('Invalid question IDs in guided_questions', 400);
    }
  }

  // Validate photos array length
  if (data.photos && data.photos.length > 5) {
    throw new CustomError('Maximum 5 photos allowed per spot', 400);
  }

  // Update the spot
  const updatedSpot = await prisma.spot.update({
    where: { id: spotId },
    data: {
      rating: data.rating,
      notes: data.notes !== undefined ? data.notes : undefined,
      tags: data.tags,
      photos: data.photos ? (data.photos as any) : undefined,
      guidedQuestions: data.guidedQuestions ? (data.guidedQuestions as any) : undefined,
    },
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

  return updatedSpot;
}

/**
 * Delete a spot
 */
export async function deleteSpot(spotId: string, userId: string) {
  // Check if spot exists and belongs to user
  const spot = await prisma.spot.findUnique({
    where: { id: spotId },
  });

  if (!spot) {
    throw new CustomError('Spot not found', 404);
  }

  if (spot.userId !== userId) {
    throw new CustomError('You do not have permission to delete this spot', 403);
  }

  // Delete the spot
  await prisma.spot.delete({
    where: { id: spotId },
  });

  return { success: true };
}

/**
 * Get user's spot for a specific place
 */
export async function getUserSpotForPlace(userId: string, placeId: string) {
  const spot = await prisma.spot.findUnique({
    where: {
      userId_placeId: {
        userId,
        placeId,
      },
    },
  });

  return spot;
}

