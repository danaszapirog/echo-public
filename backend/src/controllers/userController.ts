import { Request, Response, NextFunction } from 'express';
import { getUserById, updateUser, getUserPublicProfile, searchUsers } from '../services/userService';
import { updateUserSchema } from '../validators/userValidator';
import { uploadImage, extractS3Key, deleteImage } from '../services/imageService';
import { CustomError } from '../middleware/errorHandler';
import { getPlaylists } from '../services/playlistService';

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const user = await getUserById(req.user.userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    // Validate input
    const validatedInput = updateUserSchema.parse(req.body);

    // Update user
    const updatedUser = await updateUser(req.user.userId, validatedInput);

    res.status(200).json(updatedUser);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as any;
      res.status(400).json({
        error: 'Validation error',
        details: zodError.errors,
      });
      return;
    }
    next(error);
  }
};

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.userId;

    const user = await getUserPublicProfile(userId, requestingUserId);
    if (!user) {
      throw new CustomError('User not found or profile is private', 404);
    }

    // Get user's published playlists
    // Only show if user.canViewContent is true (handled in getUserPublicProfile)
    let playlists: any[] = [];
    if (user.canViewContent) {
      const playlistsResult = await getPlaylists({
        userId,
        isPublished: true, // Only show published playlists
        limit: 10,
        offset: 0,
      });
      playlists = playlistsResult.playlists.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        cover_image_url: p.coverImageUrl,
        spot_count: p._count.spots,
        created_at: p.createdAt,
        published_at: p.publishedAt,
      }));
    }

    // Remove internal fields from response
    const { canViewContent, ...userResponse } = user;

    res.status(200).json({
      ...userResponse,
      playlists,
      follow_status: user.followStatus || null,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const file = req.file;
    if (!file) {
      throw new CustomError('No file uploaded', 400);
    }

    // Get current user to check for existing avatar
    const currentUser = await getUserById(req.user.userId);
    if (!currentUser) {
      throw new CustomError('User not found', 404);
    }

    // Delete old avatar if exists
    if (currentUser.profilePictureUrl) {
      const oldKey = extractS3Key(currentUser.profilePictureUrl);
      if (oldKey) {
        try {
          await deleteImage(oldKey);
        } catch (error) {
          // Log error but don't fail the upload
          console.error('Failed to delete old avatar:', error);
        }
      }
    }

    // Upload new avatar
    const uploadResult = await uploadImage(file, 'avatars');

    // Update user record
    const updatedUser = await updateUser(req.user.userId, {
      profilePictureUrl: uploadResult.url,
    });

    res.status(200).json({
      user: updatedUser,
      imageUrl: uploadResult.url,
    });
  } catch (error) {
    next(error);
  }
};

export const searchUsersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query.q as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const requestingUserId = req.user?.userId;

    if (!query) {
      res.status(400).json({
        error: 'Query parameter "q" is required',
      });
      return;
    }

    const result = await searchUsers(query, requestingUserId, limit, offset);

    res.status(200).json({
      users: result.users.map((user) => ({
        id: user.id,
        username: user.username,
        profile_picture_url: user.profilePictureUrl,
        role: user.role,
        is_verified: user.isVerified, // Highlight verified creators
      })),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  } catch (error) {
    next(error);
  }
};

