import { Request, Response, NextFunction } from 'express';
import { createSpot, getSpotById, updateSpot, deleteSpot } from '../services/spotService';
import { createSpotSchema, updateSpotSchema } from '../validators/spotValidator';
import { CustomError } from '../middleware/errorHandler';

export const createSpotHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const validatedData = createSpotSchema.parse(req.body);

    const spot = await createSpot({
      placeId: validatedData.place_id,
      userId: req.user.userId,
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

export const getSpotHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { spotId } = req.params;
    const spot = await getSpotById(spotId);

    res.status(200).json({
      id: spot.id,
      place: {
        id: spot.place.id,
        name: spot.place.name,
        latitude: spot.place.latitude,
        longitude: spot.place.longitude,
        categories: spot.place.categories,
      },
      user: {
        id: spot.user.id,
        username: spot.user.username,
        profile_picture_url: spot.user.profilePictureUrl,
      },
      rating: spot.rating,
      notes: spot.notes,
      tags: spot.tags,
      photos: spot.photos ? (spot.photos as string[]) : [],
      guided_questions: spot.guidedQuestions || {},
      created_at: spot.createdAt,
      updated_at: spot.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSpotHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const { spotId } = req.params;
    const validatedData = updateSpotSchema.parse(req.body);

    const spot = await updateSpot(spotId, req.user.userId, {
      rating: validatedData.rating,
      notes: validatedData.notes,
      tags: validatedData.tags,
      photos: validatedData.photos,
      guidedQuestions: validatedData.guided_questions,
    });

    res.status(200).json({
      id: spot.id,
      place_id: spot.placeId,
      rating: spot.rating,
      notes: spot.notes,
      tags: spot.tags,
      photos: spot.photos ? (spot.photos as string[]) : [],
      guided_questions: spot.guidedQuestions || {},
      created_at: spot.createdAt,
      updated_at: spot.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSpotHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const { spotId } = req.params;
    await deleteSpot(spotId, req.user.userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

