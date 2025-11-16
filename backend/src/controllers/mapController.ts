import { Request, Response, NextFunction } from 'express';
import { getUserMapLocations } from '../services/mapService';
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

