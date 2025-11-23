import { placeDataService } from '../services/placeDataService';
import { foursquareService } from '../services/foursquareService';
import { cacheService } from '../services/cacheService';

// Mock external dependencies
jest.mock('../services/foursquareService');
jest.mock('../services/cacheService');

describe('Place Data Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (cacheService.get as jest.Mock).mockResolvedValue(null);
  });

  describe('searchPlaces', () => {
    it('should search places via Foursquare', async () => {
      const mockPlaces = [
        {
          fsq_place_id: 'fsq_123',
          name: 'Test Place',
          latitude: 40.7282,
          longitude: -73.9942,
          location: {
            address: '123 Test St',
            locality: 'New York',
            region: 'NY',
            country: 'US',
          },
          categories: [{ id: '13000', name: 'Restaurant' }],
        },
      ];

      (foursquareService.searchPlaces as jest.Mock).mockResolvedValue(mockPlaces);

      const result = await placeDataService.searchPlaces({
        query: 'pizza',
        lat: 40.7282,
        lng: -73.9942,
        limit: 10,
      });

      expect(foursquareService.searchPlaces).toHaveBeenCalledWith({
        query: 'pizza',
        lat: 40.7282,
        lng: -73.9942,
        limit: 10,
      });
      expect(result).toHaveLength(1);
      expect(result[0].externalPlaceId).toBe('fsq_123');
      expect(result[0].name).toBe('Test Place');
    });

    it('should handle Foursquare API errors', async () => {
      const error = new Error('Foursquare API error');
      (foursquareService.searchPlaces as jest.Mock).mockRejectedValue(error);

      await expect(
        placeDataService.searchPlaces({ query: 'pizza' })
      ).rejects.toThrow('Foursquare API error');
    });
  });

  describe('getPlaceDetails', () => {
    it('should return cached place if available', async () => {
      const cachedPlace = {
        externalPlaceId: 'fsq_123',
        externalProvider: 'foursquare',
        name: 'Cached Place',
        latitude: 40.7282,
        longitude: -73.9942,
        categories: ['Restaurant'],
      };

      (cacheService.get as jest.Mock).mockResolvedValue(cachedPlace);

      const result = await placeDataService.getPlaceDetails('fsq_123');

      expect(cacheService.get).toHaveBeenCalledWith('place:external_id:foursquare:fsq_123');
      expect(result).toEqual(cachedPlace);
      expect(foursquareService.getPlaceDetails).not.toHaveBeenCalled();
    });

    it('should fetch from Foursquare if not cached', async () => {
      const mockPlace = {
        fsq_place_id: 'fsq_123',
        name: 'Test Place',
        latitude: 40.7282,
        longitude: -73.9942,
        location: {
          address: '123 Test St',
          locality: 'New York',
          region: 'NY',
          country: 'US',
        },
        categories: [{ id: '13000', name: 'Restaurant' }],
      };

      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (foursquareService.getPlaceDetails as jest.Mock).mockResolvedValue(mockPlace);
      (cacheService.set as jest.Mock).mockResolvedValue(undefined);

      const result = await placeDataService.getPlaceDetails('fsq_123');

      expect(foursquareService.getPlaceDetails).toHaveBeenCalledWith('fsq_123');
      expect(cacheService.set).toHaveBeenCalled();
      expect(result).toBeTruthy();
      expect(result?.externalPlaceId).toBe('fsq_123');
    });

    it('should return null if place not found', async () => {
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (foursquareService.getPlaceDetails as jest.Mock).mockResolvedValue(null);

      const result = await placeDataService.getPlaceDetails('fsq_invalid');

      expect(result).toBeNull();
      expect(cacheService.set).not.toHaveBeenCalled();
    });
  });
});

