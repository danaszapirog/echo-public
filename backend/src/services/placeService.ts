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

