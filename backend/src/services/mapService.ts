import { prisma } from '../config/prisma';
import { cacheService } from './cacheService';

export interface MapLocation {
  place_id: string;
  latitude: number;
  longitude: number;
  pin_type: 'spot' | 'want_to_go';
  spot_id?: string;
  want_to_go_id?: string;
}

export interface MapPin {
  place_id: string;
  latitude: number;
  longitude: number;
  pin_type: 'spot' | 'want_to_go' | 'network';
  spot_count?: number; // Number of network spots at this location
}

export interface MapCluster {
  latitude: number;
  longitude: number;
  count: number;
}

export interface MapPinsResponse {
  pins: MapPin[];
  clusters: MapCluster[];
}

/**
 * Get user's personal map locations (spots and want-to-go items)
 */
export async function getUserMapLocations(
  userId: string,
  viewport?: {
    north: number;
    south: number;
    east: number;
    west: number;
  }
) {
  // Build where clause for viewport filtering
  const whereClause: any = {
    userId,
    place: viewport
      ? {
          latitude: {
            gte: viewport.south,
            lte: viewport.north,
          },
          longitude: {
            gte: viewport.west,
            lte: viewport.east,
          },
        }
      : undefined,
  };

  // Get spots
  const spots = await prisma.spot.findMany({
    where: whereClause,
    include: {
      place: {
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          categories: true,
        },
      },
    },
  });

  // Get want-to-go items
  const wantToGoItems = await prisma.wantToGo.findMany({
    where: whereClause,
    include: {
      place: {
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          categories: true,
        },
      },
    },
  });

  // Combine and format locations
  const locations: MapLocation[] = [];

  // Add spots
  for (const spot of spots) {
    locations.push({
      place_id: spot.placeId,
      latitude: Number(spot.place.latitude),
      longitude: Number(spot.place.longitude),
      pin_type: 'spot',
      spot_id: spot.id,
    });
  }

  // Add want-to-go items
  for (const item of wantToGoItems) {
    locations.push({
      place_id: item.placeId,
      latitude: Number(item.place.latitude),
      longitude: Number(item.place.longitude),
      pin_type: 'want_to_go',
      want_to_go_id: item.id,
    });
  }

  return locations;
}

/**
 * Generate cache key for map pins
 */
function getMapPinsCacheKey(
  north: number,
  south: number,
  east: number,
  west: number,
  userId?: string,
  includeNetwork: boolean = true
): string {
  // Normalize coordinates to 6 decimal places (~0.1 meter precision)
  const normalize = (coord: number) => Math.round(coord * 1000000) / 1000000;
  
  const parts = [
    'map_pins',
    normalize(north).toFixed(6),
    normalize(south).toFixed(6),
    normalize(east).toFixed(6),
    normalize(west).toFixed(6),
    userId || 'anonymous',
    includeNetwork ? 'network' : 'own',
  ];
  return parts.join(':');
}

/**
 * Get map pins for viewport
 * Includes user's own spots/want-to-go and network spots from followed users
 */
export async function getMapPins(
  userId: string,
  viewport: {
    north: number;
    south: number;
    east: number;
    west: number;
  },
  options: {
    zoom?: number;
    includeNetwork?: boolean;
  } = {}
): Promise<MapPinsResponse> {
  const { zoom, includeNetwork = true } = options;

  // Check cache first
  const cacheKey = getMapPinsCacheKey(
    viewport.north,
    viewport.south,
    viewport.east,
    viewport.west,
    userId,
    includeNetwork
  );

  const cached = await cacheService.get<MapPinsResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  // Build viewport filter for places
  const placeFilter = {
    latitude: {
      gte: viewport.south,
      lte: viewport.north,
    },
    longitude: {
      gte: viewport.west,
      lte: viewport.east,
    },
  };

  // Get user's own spots and want-to-go items
  const [userSpots, userWantToGo] = await Promise.all([
    prisma.spot.findMany({
      where: {
        userId,
        place: placeFilter,
      },
      include: {
        place: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    }),
    prisma.wantToGo.findMany({
      where: {
        userId,
        place: placeFilter,
      },
      include: {
        place: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    }),
  ]);

  // Get network spots (from followed users) if requested
  let networkSpots: any[] = [];
  if (includeNetwork) {
    // Get list of users the current user follows
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
      networkSpots = await prisma.spot.findMany({
        where: {
          userId: { in: followedUserIds },
          place: placeFilter,
        },
        include: {
          place: {
            select: {
              id: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      });
    }
  }

  // Aggregate pins by place
  const pinsByPlace = new Map<string, MapPin>();

  // Add user's own spots
  for (const spot of userSpots) {
    const placeId = spot.placeId;
    if (!pinsByPlace.has(placeId)) {
      pinsByPlace.set(placeId, {
        place_id: placeId,
        latitude: Number(spot.place.latitude),
        longitude: Number(spot.place.longitude),
        pin_type: 'spot',
        spot_count: 0,
      });
    }
    // User's own spots take priority (don't overwrite)
  }

  // Add user's want-to-go items (only if no spot exists)
  for (const item of userWantToGo) {
    const placeId = item.placeId;
    if (!pinsByPlace.has(placeId)) {
      pinsByPlace.set(placeId, {
        place_id: placeId,
        latitude: Number(item.place.latitude),
        longitude: Number(item.place.longitude),
        pin_type: 'want_to_go',
        spot_count: 0,
      });
    }
  }

  // Count network spots by place
  const networkSpotCounts = new Map<string, number>();
  for (const spot of networkSpots) {
    const placeId = spot.placeId;
    const count = networkSpotCounts.get(placeId) || 0;
    networkSpotCounts.set(placeId, count + 1);

    // Add network pin if place not already in map (user doesn't have spot/want-to-go)
    if (!pinsByPlace.has(placeId)) {
      pinsByPlace.set(placeId, {
        place_id: placeId,
        latitude: Number(spot.place.latitude),
        longitude: Number(spot.place.longitude),
        pin_type: 'network',
        spot_count: 0, // Will be set below
      });
    }
  }

  // Update spot counts for all pins
  for (const [placeId, pin] of pinsByPlace.entries()) {
    pin.spot_count = networkSpotCounts.get(placeId) || 0;
  }

  const pins = Array.from(pinsByPlace.values());

  // Apply clustering if zoom level is provided and low
  const clusters: MapCluster[] = [];
  const CLUSTERING_THRESHOLD = 12; // Cluster below zoom level 12

  if (zoom !== undefined && zoom < CLUSTERING_THRESHOLD) {
    // Simple grid-based clustering
    const gridSize = 360 / Math.pow(2, zoom); // Grid cell size in degrees

    const grid = new Map<string, MapPin[]>();

    // Group pins into grid cells
    for (const pin of pins) {
      const gridX = Math.floor(pin.longitude / gridSize);
      const gridY = Math.floor(pin.latitude / gridSize);
      const key = `${gridX},${gridY}`;

      if (!grid.has(key)) {
        grid.set(key, []);
      }
      grid.get(key)!.push(pin);
    }

    // Create clusters for cells with multiple pins
    for (const [, cellPins] of grid.entries()) {
      if (cellPins.length > 1) {
        // Calculate center of cluster
        const avgLat =
          cellPins.reduce((sum, p) => sum + p.latitude, 0) / cellPins.length;
        const avgLng =
          cellPins.reduce((sum, p) => sum + p.longitude, 0) / cellPins.length;

        clusters.push({
          latitude: avgLat,
          longitude: avgLng,
          count: cellPins.length,
        });
      } else {
        // Single pin, add to regular pins (will be filtered out of clusters)
        // Keep it in pins array
      }
    }

    // Filter out clustered pins from pins array
    const clusteredPlaceIds = new Set(
      clusters.flatMap((c) => {
        // Find pins in this cluster's grid cell
        const gridX = Math.floor(c.longitude / gridSize);
        const gridY = Math.floor(c.latitude / gridSize);
        const key = `${gridX},${gridY}`;
        const cellPins = grid.get(key) || [];
        return cellPins.map((p) => p.place_id);
      })
    );

    const filteredPins = pins.filter((p) => !clusteredPlaceIds.has(p.place_id));

    const result: MapPinsResponse = {
      pins: filteredPins,
      clusters,
    };

    // Cache the result
    await cacheService.set(cacheKey, result, { ttl: 300 }); // 5 minutes

    return result;
  }

  // No clustering, return all pins
  const result: MapPinsResponse = {
    pins,
    clusters: [],
  };

  // Cache the result
  await cacheService.set(cacheKey, result, { ttl: 300 }); // 5 minutes

  return result;
}

