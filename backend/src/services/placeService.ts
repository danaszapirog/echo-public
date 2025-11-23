import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '../config/prisma';
import { placeDataService } from './placeDataService';
import { CustomError } from '../middleware/errorHandler';

export interface PlaceWithDetails {
  id: string;
  externalPlaceId: string;
  externalProvider: string;
  name: string;
  latitude: number;
  longitude: number;
  categories: string[];
  cachedData: any;
  cachedAt: Date | null;
  createdAt: Date;
}

/**
 * Get or create a place in the database
 * Checks database first, then fetches from external API if not found
 */
export const getOrCreatePlace = async (
  externalPlaceId: string,
  provider: string = 'foursquare'
): Promise<PlaceWithDetails> => {
  // First, try to find in database
  const existingPlace = await prisma.place.findUnique({
    where: {
      externalPlaceId,
    },
  });

  if (existingPlace) {
    return {
      id: existingPlace.id,
      externalPlaceId: existingPlace.externalPlaceId,
      externalProvider: existingPlace.externalProvider,
      name: existingPlace.name,
      latitude: Number(existingPlace.latitude),
      longitude: Number(existingPlace.longitude),
      categories: (existingPlace.categories as string[]) || [],
      cachedData: existingPlace.cachedData,
      cachedAt: existingPlace.cachedAt,
      createdAt: existingPlace.createdAt,
    };
  }

  // Not in database, fetch from external API
  const placeData = await placeDataService.getPlaceDetails(externalPlaceId, provider);
  if (!placeData) {
    throw new CustomError('Place not found', 404);
  }

  // Store in database
  try {
    const newPlace = await prisma.place.create({
      data: {
        externalPlaceId: placeData.externalPlaceId,
        externalProvider: placeData.externalProvider,
        name: placeData.name,
        latitude: placeData.latitude,
        longitude: placeData.longitude,
        categories: placeData.categories,
        cachedData: {
          address: placeData.address,
          locality: placeData.locality,
          region: placeData.region,
          country: placeData.country,
        },
        cachedAt: new Date(),
      },
    });

    return {
      id: newPlace.id,
      externalPlaceId: newPlace.externalPlaceId,
      externalProvider: newPlace.externalProvider,
      name: newPlace.name,
      latitude: Number(newPlace.latitude),
      longitude: Number(newPlace.longitude),
      categories: (newPlace.categories as string[]) || [],
      cachedData: newPlace.cachedData,
      cachedAt: newPlace.cachedAt,
      createdAt: newPlace.createdAt,
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Race condition: place was created by another request
        // Fetch it from database
        const place = await prisma.place.findUnique({
          where: { externalPlaceId },
        });
        if (place) {
          return {
            id: place.id,
            externalPlaceId: place.externalPlaceId,
            externalProvider: place.externalProvider,
            name: place.name,
            latitude: Number(place.latitude),
            longitude: Number(place.longitude),
            categories: (place.categories as string[]) || [],
            cachedData: place.cachedData,
            cachedAt: place.cachedAt,
            createdAt: place.createdAt,
          };
        }
      }
    }
    throw error;
  }
};

/**
 * Get place by our internal UUID
 */
export const getPlaceById = async (placeId: string): Promise<PlaceWithDetails | null> => {
  const place = await prisma.place.findUnique({
    where: { id: placeId },
  });

  if (!place) {
    return null;
  }

  return {
    id: place.id,
    externalPlaceId: place.externalPlaceId,
    externalProvider: place.externalProvider,
    name: place.name,
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    categories: (place.categories as string[]) || [],
    cachedData: place.cachedData,
    cachedAt: place.cachedAt,
    createdAt: place.createdAt,
  };
};

/**
 * Get place summary card data
 * Returns aggregated data about network spots for a place
 */
export async function getPlaceSummary(placeId: string, userId?: string) {
  // Get place
  const place = await prisma.place.findUnique({
    where: { id: placeId },
    select: {
      id: true,
      name: true,
      categories: true,
    },
  });

  if (!place) {
    throw new CustomError('Place not found', 404);
  }

  // Get network spots (from users the current user follows, or all if not authenticated)
  let networkSpotsQuery: any = {
    placeId,
  };

  if (userId) {
    // Get users the current user follows
    const follows = await prisma.follow.findMany({
      where: {
        followerId: userId,
        status: 'active',
      },
      select: {
        followeeId: true,
      },
    });

    const followedUserIds = follows.map((f) => f.followeeId);

    if (followedUserIds.length > 0) {
      networkSpotsQuery.userId = { in: followedUserIds };
    } else {
      // User follows no one, return empty summary
      return {
        place_id: placeId,
        name: place.name,
        primary_category:
          Array.isArray(place.categories) && place.categories.length > 0
            ? place.categories[0]
            : null,
        network_spot_count: 0,
        average_rating: null,
        common_tags: [],
      };
    }
  }

  // Get network spots with aggregations
  const networkSpots = await prisma.spot.findMany({
    where: networkSpotsQuery,
    select: {
      rating: true,
      tags: true,
    },
  });

  // Calculate statistics
  const networkSpotCount = networkSpots.length;
  const averageRating =
    networkSpotCount > 0
      ? networkSpots.reduce((sum, s) => sum + s.rating, 0) / networkSpotCount
      : null;

  // Get common tags (tags that appear in at least 2 spots)
  const tagCounts = new Map<string, number>();
  for (const spot of networkSpots) {
    for (const tag of spot.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  const commonTags = Array.from(tagCounts.entries())
    .filter(([_, count]) => count >= 2)
    .sort(([_, countA], [__, countB]) => countB - countA)
    .slice(0, 5) // Top 5 most common tags
    .map(([tag, _]) => tag);

  return {
    place_id: placeId,
    name: place.name,
    primary_category:
      Array.isArray(place.categories) && place.categories.length > 0
        ? place.categories[0]
        : null,
    network_spot_count: networkSpotCount,
    average_rating: averageRating ? Math.round(averageRating * 10) / 10 : null, // Round to 1 decimal
    common_tags: commonTags,
  };
}

