import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler';
import env from '../config/env';

/**
 * Middleware to check if user is an admin
 * For MVP, we'll use an environment variable to check admin status
 * In production, this should be a proper role-based system
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new CustomError('Unauthorized', 401);
  }

  // Check if user is admin via environment variable or user role
  // For MVP, we'll check if ADMIN_USER_IDS env var contains the user ID
  const adminUserIds = env.ADMIN_USER_IDS?.split(',').map((id) => id.trim()) || [];

  if (!adminUserIds.includes(req.user.userId)) {
    throw new CustomError('Forbidden: Admin access required', 403);
  }

  next();
};

