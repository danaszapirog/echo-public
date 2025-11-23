import { Request, Response, NextFunction } from 'express';
import { getFeedItems } from '../services/feedService';
import { CustomError } from '../middleware/errorHandler';

export const getFeedHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const cursor = req.query.cursor as string | undefined;

    const result = await getFeedItems(req.user.userId, limit, cursor);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

