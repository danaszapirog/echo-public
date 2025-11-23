import { Request, Response, NextFunction } from 'express';
import {
  createPlaylist,
  getPlaylistById,
  getPlaylists,
  updatePlaylist,
  deletePlaylist,
  publishPlaylist,
  unpublishPlaylist,
  addSpotToPlaylist,
  removeSpotFromPlaylist,
} from '../services/playlistService';
import {
  createPlaylistSchema,
  updatePlaylistSchema,
  addRemoveSpotSchema,
} from '../validators/playlistValidator';
import { CustomError } from '../middleware/errorHandler';

export const createPlaylistHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const validatedData = createPlaylistSchema.parse(req.body);

    const playlist = await createPlaylist({
      userId: req.user.userId,
      title: validatedData.title,
      description: validatedData.description,
      coverImageUrl: validatedData.cover_image_url,
      spotIds: validatedData.spot_ids,
    });

    res.status(201).json({
      id: playlist.id,
      title: playlist.title,
      description: playlist.description,
      cover_image_url: playlist.coverImageUrl,
      is_published: playlist.isPublished,
      created_at: playlist.createdAt,
      updated_at: playlist.updatedAt,
      published_at: playlist.publishedAt,
      user: {
        id: playlist.user.id,
        username: playlist.user.username,
        profile_picture_url: playlist.user.profilePictureUrl,
      },
      spots: playlist.spots.map((ps) => ({
        id: ps.spot.id,
        place: {
          id: ps.spot.place.id,
          name: ps.spot.place.name,
          latitude: ps.spot.place.latitude,
          longitude: ps.spot.place.longitude,
          categories: ps.spot.place.categories,
        },
        rating: ps.spot.rating,
        notes: ps.spot.notes,
        tags: ps.spot.tags,
        display_order: ps.displayOrder,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getPlaylistHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { playlistId } = req.params;
    const userId = req.user?.userId;

    const playlist = await getPlaylistById(playlistId, userId);

    res.status(200).json({
      id: playlist.id,
      title: playlist.title,
      description: playlist.description,
      cover_image_url: playlist.coverImageUrl,
      is_published: playlist.isPublished,
      created_at: playlist.createdAt,
      updated_at: playlist.updatedAt,
      published_at: playlist.publishedAt,
      user: {
        id: playlist.user.id,
        username: playlist.user.username,
        profile_picture_url: playlist.user.profilePictureUrl,
      },
      spots: playlist.spots.map((ps) => ({
        id: ps.spot.id,
        place: {
          id: ps.spot.place.id,
          name: ps.spot.place.name,
          latitude: ps.spot.place.latitude,
          longitude: ps.spot.place.longitude,
          categories: ps.spot.place.categories,
        },
        user: {
          id: ps.spot.user.id,
          username: ps.spot.user.username,
          profile_picture_url: ps.spot.user.profilePictureUrl,
        },
        rating: ps.spot.rating,
        notes: ps.spot.notes,
        tags: ps.spot.tags,
        photos: ps.spot.photos ? (ps.spot.photos as string[]) : [],
        display_order: ps.displayOrder,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const listPlaylistsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.query.user_id as string | undefined;
    const isPublished = req.query.is_published
      ? req.query.is_published === 'true'
      : undefined;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await getPlaylists({
      userId,
      isPublished,
      limit,
      offset,
    });

    res.status(200).json({
      playlists: result.playlists.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        cover_image_url: p.coverImageUrl,
        is_published: p.isPublished,
        created_at: p.createdAt,
        updated_at: p.updatedAt,
        published_at: p.publishedAt,
        user: {
          id: p.user.id,
          username: p.user.username,
          profile_picture_url: p.user.profilePictureUrl,
        },
        spot_count: p._count.spots,
      })),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlaylistHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const { playlistId } = req.params;
    const validatedData = updatePlaylistSchema.parse(req.body);

    const playlist = await updatePlaylist(playlistId, req.user.userId, {
      title: validatedData.title,
      description: validatedData.description,
      coverImageUrl: validatedData.cover_image_url,
    });

    res.status(200).json({
      id: playlist.id,
      title: playlist.title,
      description: playlist.description,
      cover_image_url: playlist.coverImageUrl,
      is_published: playlist.isPublished,
      created_at: playlist.createdAt,
      updated_at: playlist.updatedAt,
      published_at: playlist.publishedAt,
      user: {
        id: playlist.user.id,
        username: playlist.user.username,
        profile_picture_url: playlist.user.profilePictureUrl,
      },
      spots: playlist.spots.map((ps) => ({
        id: ps.spot.id,
        place: {
          id: ps.spot.place.id,
          name: ps.spot.place.name,
          latitude: ps.spot.place.latitude,
          longitude: ps.spot.place.longitude,
          categories: ps.spot.place.categories,
        },
        display_order: ps.displayOrder,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlaylistHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const { playlistId } = req.params;
    await deletePlaylist(playlistId, req.user.userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const publishPlaylistHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const { playlistId } = req.params;
    const playlist = await publishPlaylist(playlistId, req.user.userId);

    res.status(200).json({
      id: playlist.id,
      title: playlist.title,
      is_published: playlist.isPublished,
      published_at: playlist.publishedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const unpublishPlaylistHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const { playlistId } = req.params;
    const playlist = await unpublishPlaylist(playlistId, req.user.userId);

    res.status(200).json({
      id: playlist.id,
      title: playlist.title,
      is_published: playlist.isPublished,
      published_at: playlist.publishedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const addRemoveSpotHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const { playlistId } = req.params;
    const validatedData = addRemoveSpotSchema.parse(req.body);

    let playlist;
    if (validatedData.action === 'add') {
      playlist = await addSpotToPlaylist(
        playlistId,
        req.user.userId,
        validatedData.spot_id,
        validatedData.display_order
      );
    } else {
      playlist = await removeSpotFromPlaylist(
        playlistId,
        req.user.userId,
        validatedData.spot_id
      );
    }

    res.status(200).json({
      id: playlist.id,
      title: playlist.title,
      spots: playlist.spots.map((ps) => ({
        id: ps.spot.id,
        place: {
          id: ps.spot.place.id,
          name: ps.spot.place.name,
        },
        display_order: ps.displayOrder,
      })),
    });
  } catch (error) {
    next(error);
  }
};

