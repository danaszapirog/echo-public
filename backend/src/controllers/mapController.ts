import { Request, Response, NextFunction } from 'express';
import { getUserMapLocations, getMapPins } from '../services/mapService';
import { CustomError } from '../middleware/errorHandler';
import { z } from 'zod';

const viewportSchema = z.object({
  north: z.coerce.number(),
  south: z.coerce.number(),
  east: z.coerce.number(),
  west: z.coerce.number(),
});

export const getMyLocations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    // Parse viewport if provided
    let viewport;
    if (req.query.north && req.query.south && req.query.east && req.query.west) {
      viewport = viewportSchema.parse({
        north: req.query.north,
        south: req.query.south,
        east: req.query.east,
        west: req.query.west,
      });
    }

    const locations = await getUserMapLocations(req.user.userId, viewport);

    res.status(200).json({
      locations,
      count: locations.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getMapPinsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    // Validate viewport parameters (required)
    if (
      !req.query.north ||
      !req.query.south ||
      !req.query.east ||
      !req.query.west
    ) {
      throw new CustomError(
        'Viewport parameters (north, south, east, west) are required',
        400
      );
    }

    const viewport = viewportSchema.parse({
      north: req.query.north,
      south: req.query.south,
      east: req.query.east,
      west: req.query.west,
    });

    // Validate viewport bounds
    if (viewport.north <= viewport.south) {
      throw new CustomError('North must be greater than south', 400);
    }
    if (viewport.east <= viewport.west) {
      throw new CustomError('East must be greater than west', 400);
    }
    if (
      viewport.north > 90 ||
      viewport.south < -90 ||
      viewport.east > 180 ||
      viewport.west < -180
    ) {
      throw new CustomError('Invalid viewport coordinates', 400);
    }

    // Parse optional parameters
    const zoom = req.query.zoom
      ? parseInt(req.query.zoom as string, 10)
      : undefined;
    const includeNetwork =
      req.query.include_network === 'false' ? false : true;

    const result = await getMapPins(req.user.userId, viewport, {
      zoom,
      includeNetwork,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

