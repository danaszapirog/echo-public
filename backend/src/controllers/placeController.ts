import { Request, Response, NextFunction } from 'express';
import { placeDataService } from '../services/placeDataService';
import { getOrCreatePlace, getPlaceById } from '../services/placeService';
import { searchPlacesSchema } from '../validators/placeValidator';
import { CustomError } from '../middleware/errorHandler';

export const searchPlaces = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate query parameters
    const validatedParams = searchPlacesSchema.parse(req.query);

    // At least query or lat/lng must be provided
    if (!validatedParams.q && (!validatedParams.lat || !validatedParams.lng)) {
      throw new CustomError('Either query (q) or location (lat, lng) must be provided', 400);
    }

    // Search places
    const places = await placeDataService.searchPlaces({
      query: validatedParams.q,
      lat: validatedParams.lat,
      lng: validatedParams.lng,
      limit: validatedParams.limit,
      radius: validatedParams.radius,
    });

    res.status(200).json({
      places,
      count: places.length,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as any;
      res.status(400).json({
        error: 'Validation error',
        details: zodError.errors,
      });
      return;
    }
    next(error);
  }
};

export const getPlaceDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { placeId } = req.params;

    // Check if placeId is a UUID (our internal ID) or external ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUUID = uuidRegex.test(placeId);

    let place;

    if (isUUID) {
      // Try to get by our UUID first
      place = await getPlaceById(placeId);
    }

    // If not found by UUID (or not a UUID), try as external ID
    if (!place) {
      place = await getOrCreatePlace(placeId, 'foursquare');
    }

    if (!place) {
      throw new CustomError('Place not found', 404);
    }

    res.status(200).json({
      place: {
        id: place.id,
        externalPlaceId: place.externalPlaceId,
        name: place.name,
        latitude: place.latitude,
        longitude: place.longitude,
        categories: place.categories,
        address: place.cachedData?.address,
        locality: place.cachedData?.locality,
        region: place.cachedData?.region,
        country: place.cachedData?.country,
        cachedAt: place.cachedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

