import { Request, Response, NextFunction } from 'express';
import { makeUserCreator } from '../services/adminService';
import { CustomError } from '../middleware/errorHandler';

export const makeCreatorHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    await makeUserCreator(userId);

    res.status(200).json({
      message: 'User successfully assigned creator role',
      user_id: userId,
    });
  } catch (error) {
    next(error);
  }
};

