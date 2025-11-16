import { foursquareService, FoursquarePlace } from './foursquareService';
import { cacheService } from './cacheService';

export interface PlaceData {
  externalPlaceId: string;
  externalProvider: string;
  name: string;
  latitude: number;
  longitude: number;
  categories: string[];
  address?: string;
  locality?: string;
  region?: string;
  country?: string;
}

// Cache TTL: 30 days in seconds
const PLACE_CACHE_TTL = 30 * 24 * 60 * 60;

/**
 * Abstraction layer for place data providers
 * Currently supports Foursquare, can be extended for other providers
 */
export class PlaceDataService {
  /**
   * Search for places
   */
  async searchPlaces(params: {
    query?: string;
    lat?: number;
    lng?: number;
    limit?: number;
    radius?: number;
  }): Promise<PlaceData[]> {
    // Note: Search results are not cached as they're dynamic based on query/location
    // Individual places are cached when fetched by ID
    const foursquarePlaces = await foursquareService.searchPlaces(params);
    return foursquarePlaces.map(this.normalizeFoursquarePlace);
  }

  /**
   * Get place details by external ID (with caching)
   */
  async getPlaceDetails(externalPlaceId: string, provider: string = 'foursquare'): Promise<PlaceData | null> {
    const cacheKey = `place:external_id:${provider}:${externalPlaceId}`;

    // Try to get from cache first
    const cached = await cacheService.get<PlaceData>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from provider
    let place: PlaceData | null = null;
    if (provider === 'foursquare') {
      const foursquarePlace = await foursquareService.getPlaceDetails(externalPlaceId);
      if (!foursquarePlace) {
        return null;
      }
      place = this.normalizeFoursquarePlace(foursquarePlace);
    } else {
      throw new Error(`Unsupported place provider: ${provider}`);
    }

    // Cache the result for 30 days
    if (place) {
      await cacheService.set(cacheKey, place, { ttl: PLACE_CACHE_TTL });
    }

    return place;
  }

  /**
   * Normalize Foursquare place data to our format
   * Updated for new API: fsq_id → fsq_place_id, geocodes → latitude/longitude
   */
  private normalizeFoursquarePlace(place: FoursquarePlace): PlaceData {
    // New API: latitude and longitude are direct fields, not nested in geocodes
    const lat = place.latitude || place.location.latitude;
    const lng = place.longitude || place.location.longitude;

    return {
      externalPlaceId: place.fsq_place_id, // Changed from fsq_id
      externalProvider: 'foursquare',
      name: place.name,
      latitude: lat,
      longitude: lng,
      categories: place.categories.map((cat) => cat.name),
      address: place.location.address,
      locality: place.location.locality,
      region: place.location.region,
      country: place.location.country,
    };
  }
}

export const placeDataService = new PlaceDataService();

