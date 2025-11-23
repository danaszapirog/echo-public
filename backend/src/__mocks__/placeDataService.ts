/**
 * Mock Place Data Service for Testing
 * Provides mock implementations of place data operations
 */

import { PlaceData } from '../services/placeDataService';

export const mockPlaceData: PlaceData[] = [
  {
    externalPlaceId: 'fsq_4d4ebc2d7a624320',
    externalProvider: 'foursquare',
    name: 'Joe\'s Pizza',
    latitude: 40.7282,
    longitude: -73.9942,
    categories: ['Pizza Place'],
    address: '7 Carmine St',
    locality: 'New York',
    region: 'NY',
    country: 'US',
  },
  {
    externalPlaceId: 'fsq_5e5fcd3e8b735431',
    externalProvider: 'foursquare',
    name: 'Blue Bottle Coffee',
    latitude: 40.7500,
    longitude: -73.9900,
    categories: ['Coffee Shop'],
    address: '1 E 28th St',
    locality: 'New York',
    region: 'NY',
    country: 'US',
  },
];

export const mockPlaceDataService = {
  searchPlaces: jest.fn<Promise<PlaceData[]>, any[]>().mockResolvedValue(mockPlaceData),
  getPlaceDetails: jest.fn<Promise<PlaceData | null>, [string, string?]>().mockImplementation(
    (externalPlaceId: string) => {
      const place = mockPlaceData.find((p) => p.externalPlaceId === externalPlaceId);
      return Promise.resolve(place || null);
    }
  ),
};

