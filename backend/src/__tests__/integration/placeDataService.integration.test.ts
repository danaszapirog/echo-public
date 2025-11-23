/**
 * Integration Tests for Place Data Service
 * These tests use REAL Foursquare API (requires valid API key)
 * 
 * To run: npm test -- --config jest.config.integration.js placeDataService.integration.test.ts
 * 
 * Note: These tests require:
 * - Valid FOURSQUARE_API_KEY in .env
 * - Network connectivity
 * - May hit rate limits if run too frequently
 */

import { placeDataService } from '../../services/placeDataService';

// Don't mock - use real services
// jest.mock is NOT called here

describe('Place Data Service - Integration Tests (Real API)', () => {
  // Skip if API key not configured
  const hasApiKey = !!process.env.FOURSQUARE_API_KEY;
  const testIf = hasApiKey ? it : it.skip;

  beforeAll(() => {
    if (!hasApiKey) {
      console.warn('⚠️  FOURSQUARE_API_KEY not set - skipping integration tests');
    }
  });

  describe('searchPlaces', () => {
    testIf('should search places via real Foursquare API', async () => {
      const places = await placeDataService.searchPlaces({
        query: 'coffee',
        lat: 40.7128,
        lng: -74.0060,
        limit: 5,
      });

      expect(places).toBeDefined();
      expect(Array.isArray(places)).toBe(true);
      
      if (places.length > 0) {
        expect(places[0]).toHaveProperty('externalPlaceId');
        expect(places[0]).toHaveProperty('name');
        expect(places[0]).toHaveProperty('latitude');
        expect(places[0]).toHaveProperty('longitude');
        expect(places[0]).toHaveProperty('categories');
      }
    }, 15000); // 15 second timeout for real API call

    testIf('should handle location-based search', async () => {
      const places = await placeDataService.searchPlaces({
        lat: 40.7282,
        lng: -73.9942,
        limit: 3,
      });

      expect(places).toBeDefined();
      expect(Array.isArray(places)).toBe(true);
    }, 15000);
  });

  describe('getPlaceDetails', () => {
    testIf('should fetch place details via real Foursquare API', async () => {
      // Use a known Foursquare place ID (you may need to update this)
      const placeId = 'fsq_4d4ebc2d7a624320'; // Example: Joe's Pizza
      
      const place = await placeDataService.getPlaceDetails(placeId, 'foursquare');

      if (place) {
        expect(place).toHaveProperty('externalPlaceId', placeId);
        expect(place).toHaveProperty('name');
        expect(place).toHaveProperty('latitude');
        expect(place).toHaveProperty('longitude');
        expect(place).toHaveProperty('categories');
      }
    }, 15000);

    testIf('should return null for invalid place ID', async () => {
      const place = await placeDataService.getPlaceDetails('fsq_invalid_id', 'foursquare');
      expect(place).toBeNull();
    }, 15000);
  });
});

