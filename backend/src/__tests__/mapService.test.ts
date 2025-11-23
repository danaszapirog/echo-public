import { getMapPins } from '../services/mapService';
import { prisma } from '../config/prisma';
import { cacheService } from '../services/cacheService';

// Mock dependencies
jest.mock('../config/prisma', () => ({
  prisma: {
    spot: {
      findMany: jest.fn(),
    },
    wantToGo: {
      findMany: jest.fn(),
    },
    follow: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('../services/cacheService', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

describe('Map Service', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const viewport = {
    north: 40.8,
    south: 40.7,
    east: -73.9,
    west: -74.0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (cacheService.get as jest.Mock).mockResolvedValue(null);
  });

  describe('getMapPins', () => {
    it('should return cached result if available', async () => {
      const cachedResult = {
        pins: [{ place_id: 'place1', latitude: 40.75, longitude: -73.95, pin_type: 'spot' as const }],
        clusters: [],
      };

      (cacheService.get as jest.Mock).mockResolvedValue(cachedResult);

      const result = await getMapPins(userId, viewport);

      expect(result).toEqual(cachedResult);
      expect(prisma.spot.findMany).not.toHaveBeenCalled();
    });

    it('should return user spots and want-to-go items', async () => {
      const mockUserSpots = [
        {
          id: 'spot1',
          placeId: 'place1',
          place: {
            id: 'place1',
            latitude: 40.75,
            longitude: -73.95,
          },
        },
      ];

      const mockWantToGo = [
        {
          id: 'wtg1',
          placeId: 'place2',
          place: {
            id: 'place2',
            latitude: 40.76,
            longitude: -73.94,
          },
        },
      ];

      (prisma.spot.findMany as jest.Mock).mockResolvedValue(mockUserSpots);
      (prisma.wantToGo.findMany as jest.Mock).mockResolvedValue(mockWantToGo);
      (prisma.follow.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getMapPins(userId, viewport);

      expect(result.pins).toHaveLength(2);
      expect(result.pins[0].pin_type).toBe('spot');
      expect(result.pins[1].pin_type).toBe('want_to_go');
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should include network spots from followed users', async () => {
      const mockUserSpots: any[] = [];
      const mockWantToGo: any[] = [];
      const mockFollows = [
        { followeeId: 'followed-user-1' },
        { followeeId: 'followed-user-2' },
      ];
      const mockNetworkSpots = [
        {
          id: 'network-spot-1',
          placeId: 'place3',
          place: {
            id: 'place3',
            latitude: 40.77,
            longitude: -73.93,
          },
        },
        {
          id: 'network-spot-2',
          placeId: 'place3', // Same place, should count as 2 spots
          place: {
            id: 'place3',
            latitude: 40.77,
            longitude: -73.93,
          },
        },
      ];

      (prisma.spot.findMany as jest.Mock)
        .mockResolvedValueOnce(mockUserSpots) // User's own spots
        .mockResolvedValueOnce(mockNetworkSpots); // Network spots
      (prisma.wantToGo.findMany as jest.Mock).mockResolvedValue(mockWantToGo);
      (prisma.follow.findMany as jest.Mock).mockResolvedValue(mockFollows);

      const result = await getMapPins(userId, viewport, { includeNetwork: true });

      expect(result.pins).toHaveLength(1);
      expect(result.pins[0].pin_type).toBe('network');
      expect(result.pins[0].spot_count).toBe(2);
    });

    it('should exclude network spots if includeNetwork is false', async () => {
      const mockUserSpots: any[] = [];
      const mockWantToGo: any[] = [];

      (prisma.spot.findMany as jest.Mock).mockResolvedValue(mockUserSpots);
      (prisma.wantToGo.findMany as jest.Mock).mockResolvedValue(mockWantToGo);
      (prisma.follow.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getMapPins(userId, viewport, { includeNetwork: false });

      expect(prisma.follow.findMany).not.toHaveBeenCalled();
      expect(result.pins).toHaveLength(0);
    });

    it('should cluster pins at low zoom levels', async () => {
      const mockPins = Array.from({ length: 5 }, (_, i) => ({
        id: `spot${i}`,
        placeId: `place${i}`,
        place: {
          id: `place${i}`,
          latitude: 40.75 + i * 0.001, // Close together
          longitude: -73.95 + i * 0.001,
        },
      }));

      (prisma.spot.findMany as jest.Mock).mockResolvedValue(mockPins);
      (prisma.wantToGo.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.follow.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getMapPins(userId, viewport, { zoom: 10 });

      // At zoom 10, pins should be clustered
      expect(result.clusters.length).toBeGreaterThan(0);
    });

    it('should not cluster pins at high zoom levels', async () => {
      const mockPins = [
        {
          id: 'spot1',
          placeId: 'place1',
          place: {
            id: 'place1',
            latitude: 40.75,
            longitude: -73.95,
          },
        },
      ];

      (prisma.spot.findMany as jest.Mock).mockResolvedValue(mockPins);
      (prisma.wantToGo.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.follow.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getMapPins(userId, viewport, { zoom: 15 });

      expect(result.clusters).toHaveLength(0);
      expect(result.pins.length).toBeGreaterThan(0);
    });

    it('should prioritize user spots over want-to-go', async () => {
      const mockUserSpots = [
        {
          id: 'spot1',
          placeId: 'place1',
          place: {
            id: 'place1',
            latitude: 40.75,
            longitude: -73.95,
          },
        },
      ];

      const mockWantToGo = [
        {
          id: 'wtg1',
          placeId: 'place1', // Same place
          place: {
            id: 'place1',
            latitude: 40.75,
            longitude: -73.95,
          },
        },
      ];

      (prisma.spot.findMany as jest.Mock).mockResolvedValue(mockUserSpots);
      (prisma.wantToGo.findMany as jest.Mock).mockResolvedValue(mockWantToGo);
      (prisma.follow.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getMapPins(userId, viewport);

      expect(result.pins).toHaveLength(1);
      expect(result.pins[0].pin_type).toBe('spot'); // Spot takes priority
    });
  });
});

