import { Request, Response, NextFunction } from 'express';
import {
  createWantToGo,
  getWantToGoById,
  getUserWantToGoList,
  updateWantToGo,
  deleteWantToGo,
  convertWantToGoToSpot,
} from '../services/wantToGoService';
import {
  createWantToGoSchema,
  updateWantToGoSchema,
  convertToSpotSchema,
} from '../validators/wantToGoValidator';
import { CustomError } from '../middleware/errorHandler';

export const createWantToGoHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const validatedData = createWantToGoSchema.parse(req.body);

    const wantToGo = await createWantToGo({
      placeId: validatedData.place_id,
      userId: req.user.userId,
      notes: validatedData.notes,
    });

    res.status(201).json({
      id: wantToGo.id,
      place_id: wantToGo.placeId,
      notes: wantToGo.notes,
      created_at: wantToGo.createdAt,
      updated_at: wantToGo.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const getWantToGoListHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await getUserWantToGoList(req.user.userId, limit, offset);

    res.status(200).json({
      items: result.items.map((item) => ({
        id: item.id,
        place: {
          id: item.place.id,
          name: item.place.name,
          latitude: item.place.latitude,
          longitude: item.place.longitude,
          categories: item.place.categories,
        },
        notes: item.notes,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      })),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  } catch (error) {
    next(error);
  }
};

export const getWantToGoHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { wantToGoId } = req.params;
    const wantToGo = await getWantToGoById(wantToGoId);

    res.status(200).json({
      id: wantToGo.id,
      place: {
        id: wantToGo.place.id,
        name: wantToGo.place.name,
        latitude: wantToGo.place.latitude,
        longitude: wantToGo.place.longitude,
        categories: wantToGo.place.categories,
      },
      notes: wantToGo.notes,
      created_at: wantToGo.createdAt,
      updated_at: wantToGo.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWantToGoHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const { wantToGoId } = req.params;
    const validatedData = updateWantToGoSchema.parse(req.body);

    const wantToGo = await updateWantToGo(wantToGoId, req.user.userId, {
      notes: validatedData.notes,
    });

    res.status(200).json({
      id: wantToGo.id,
      place_id: wantToGo.placeId,
      notes: wantToGo.notes,
      created_at: wantToGo.createdAt,
      updated_at: wantToGo.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWantToGoHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const { wantToGoId } = req.params;
    await deleteWantToGo(wantToGoId, req.user.userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const convertToSpotHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const { wantToGoId } = req.params;
    const validatedData = convertToSpotSchema.parse(req.body);

    const spot = await convertWantToGoToSpot(wantToGoId, req.user.userId, {
      rating: validatedData.rating,
      notes: validatedData.notes,
      tags: validatedData.tags,
      photos: validatedData.photos,
      guidedQuestions: validatedData.guided_questions,
    });

    res.status(201).json({
      id: spot.id,
      place_id: spot.placeId,
      rating: spot.rating,
      notes: spot.notes,
      tags: spot.tags,
      photos: spot.photos ? (spot.photos as string[]) : [],
      guided_questions: spot.guidedQuestions || {},
      created_at: spot.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

