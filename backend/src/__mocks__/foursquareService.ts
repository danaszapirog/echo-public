/**
 * Mock Foursquare Service for Testing
 * Provides mock implementations of Foursquare API calls
 */

import { FoursquarePlace } from '../services/foursquareService';

export const mockFoursquarePlaces: FoursquarePlace[] = [
  {
    fsq_place_id: 'fsq_4d4ebc2d7a624320',
    name: 'Joe\'s Pizza',
    latitude: 40.7282,
    longitude: -73.9942,
    location: {
      address: '7 Carmine St',
      locality: 'New York',
      region: 'NY',
      country: 'US',
    },
    categories: [
      {
        id: '13000',
        name: 'Pizza Place',
      },
    ],
  },
  {
    fsq_place_id: 'fsq_5e5fcd3e8b735431',
    name: 'Blue Bottle Coffee',
    latitude: 40.7500,
    longitude: -73.9900,
    location: {
      address: '1 E 28th St',
      locality: 'New York',
      region: 'NY',
      country: 'US',
    },
    categories: [
      {
        id: '13035',
        name: 'Coffee Shop',
      },
    ],
  },
  {
    fsq_place_id: 'fsq_6f6gde4f9c846542',
    name: 'Central Park',
    latitude: 40.7829,
    longitude: -73.9654,
    location: {
      address: null,
      locality: 'New York',
      region: 'NY',
      country: 'US',
    },
    categories: [
      {
        id: '16000',
        name: 'Park',
      },
    ],
  },
];

export const mockFoursquareService = {
  searchPlaces: jest.fn<Promise<FoursquarePlace[]>, any[]>().mockResolvedValue(mockFoursquarePlaces),
  getPlaceDetails: jest.fn<Promise<FoursquarePlace | null>, [string]>().mockImplementation((fsqId: string) => {
    const place = mockFoursquarePlaces.find((p) => p.fsq_place_id === fsqId);
    return Promise.resolve(place || null);
  }),
};

// Export as default to match the service structure
export default mockFoursquareService;

