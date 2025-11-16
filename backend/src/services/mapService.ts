import { prisma } from '../config/prisma';

export interface MapLocation {
  place_id: string;
  latitude: number;
  longitude: number;
  pin_type: 'spot' | 'want_to_go';
  spot_id?: string;
  want_to_go_id?: string;
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

