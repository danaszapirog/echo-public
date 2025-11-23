import { Request, Response, NextFunction } from 'express';
import {
  followUser,
  unfollowUser,
  getPendingFollowRequests,
  approveFollowRequest,
  denyFollowRequest,
  getFollowById,
} from '../services/followService';
import { followUserSchema } from '../validators/followValidator';
import { CustomError } from '../middleware/errorHandler';

export const followUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const validatedData = followUserSchema.parse(req.body);
    const follow = await followUser(req.user.userId, validatedData.followee_id);

    res.status(follow.status === 'pending' ? 201 : 200).json({
      id: follow.id,
      follower_id: follow.followerId,
      followee_id: follow.followeeId,
      status: follow.status,
      created_at: follow.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

export const unfollowUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const { followId } = req.params;
    await unfollowUser(req.user.userId, followId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getFollowRequestsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const requests = await getPendingFollowRequests(req.user.userId);

    res.status(200).json({
      requests: requests.map((req) => ({
        id: req.id,
        follower: {
          id: req.follower.id,
          username: req.follower.username,
          profile_picture_url: req.follower.profilePictureUrl,
        },
        created_at: req.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const approveFollowRequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const { requestId } = req.params;
    const follow = await approveFollowRequest(req.user.userId, requestId);

    res.status(200).json({
      id: follow.id,
      follower_id: follow.followerId,
      followee_id: follow.followeeId,
      status: follow.status,
    });
  } catch (error) {
    next(error);
  }
};

export const denyFollowRequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    const { requestId } = req.params;
    await denyFollowRequest(req.user.userId, requestId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

