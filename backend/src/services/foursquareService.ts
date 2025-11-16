import axios, { AxiosInstance } from 'axios';
import env from '../config/env';

export interface FoursquarePlace {
  fsq_place_id: string; // Changed from fsq_id
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    locality?: string;
    region?: string;
    country?: string;
  };
  categories: Array<{
    id: string; // Changed from number to string (BSON ID)
    name: string;
    short_name?: string;
  }>;
  latitude: number; // Changed from geocodes.main.latitude
  longitude: number; // Changed from geocodes.main.longitude
}

export interface FoursquareSearchResponse {
  results: FoursquarePlace[];
  context?: {
    geo_bounds?: {
      circle?: {
        center: {
          latitude: number;
          longitude: number;
        };
        radius: number;
      };
    };
  };
}

class FoursquareService {
  private client: AxiosInstance;
  private serviceKey: string;
  private apiVersion: string = '2025-06-17'; // Date-based versioning

  constructor() {
    this.serviceKey = env.FOURSQUARE_API_KEY || '';

    if (!this.serviceKey) {
      console.warn('Foursquare service key not configured');
    }

    // New API host: places-api.foursquare.com (no /v3/)
    this.client = axios.create({
      baseURL: 'https://places-api.foursquare.com',
      headers: {
        Authorization: `Bearer ${this.serviceKey}`, // Changed: Bearer token format
        'Accept-Language': 'en',
        'X-Places-Api-Version': this.apiVersion, // Date-based versioning
      },
      timeout: 10000,
    });
  }

  /**
   * Search for places using Foursquare Places API (new endpoints)
   */
  async searchPlaces(params: {
    query?: string;
    lat?: number;
    lng?: number;
    limit?: number;
    radius?: number;
  }): Promise<FoursquarePlace[]> {
    if (!this.serviceKey) {
      throw new Error('Foursquare service key not configured');
    }

    try {
      const searchParams: any = {
        limit: params.limit || 20,
      };

      if (params.query) {
        searchParams.query = params.query;
      }

      if (params.lat && params.lng) {
        searchParams.ll = `${params.lat},${params.lng}`;
      }

      if (params.radius) {
        searchParams.radius = params.radius;
      }

      // New endpoint: /places/search (no /v3/)
      const response = await this.client.get<FoursquareSearchResponse>('/places/search', {
        params: searchParams,
      });

      return response.data.results || [];
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid Foursquare service key');
        }
        if (error.response?.status === 429) {
          throw new Error('Foursquare API rate limit exceeded');
        }
        throw new Error(`Foursquare API error: ${error.response?.statusText || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get place details by Foursquare place ID (new endpoint)
   */
  async getPlaceDetails(fsqPlaceId: string): Promise<FoursquarePlace | null> {
    if (!this.serviceKey) {
      throw new Error('Foursquare service key not configured');
    }

    try {
      // New endpoint: /places/{fsq_place_id} (no /v3/)
      const response = await this.client.get<FoursquarePlace>(`/places/${fsqPlaceId}`);
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null;
        }
        throw new Error(`Foursquare API error: ${error.response?.statusText || error.message}`);
      }
      throw error;
    }
  }
}

export const foursquareService = new FoursquareService();

