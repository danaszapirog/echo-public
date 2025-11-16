import { Request, Response, NextFunction } from 'express';
import { getUserById, updateUser, getUserPublicProfile } from '../services/userService';
import { updateUserSchema } from '../validators/userValidator';
import { uploadImage, extractS3Key, deleteImage } from '../services/imageService';
import { CustomError } from '../middleware/errorHandler';

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

    res.status(200).json(user);
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

