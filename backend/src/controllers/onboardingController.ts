import { Request, Response, NextFunction } from 'express';
import { getLaunchCreators, completeOnboarding } from '../services/onboardingService';
import { completeOnboardingSchema } from '../validators/onboardingValidator';
import { CustomError } from '../middleware/errorHandler';

export const getLaunchCreatorsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const creators = await getLaunchCreators();

    res.status(200).json({
      creators,
      count: creators.length,
    });
  } catch (error) {
    next(error);
  }
};

export const completeOnboardingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Unauthorized', 401);
    }

    // Validate request body
    const validatedData = completeOnboardingSchema.parse(req.body);

    // Complete onboarding
    await completeOnboarding(
      req.user.userId,
      validatedData.followed_creator_ids
    );

    res.status(200).json({
      message: 'Onboarding completed successfully',
      onboarding_completed_at: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

