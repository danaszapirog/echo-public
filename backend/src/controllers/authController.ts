import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { registerSchema, loginSchema } from '../validators/authValidator';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate input
    const validatedInput = registerSchema.parse(req.body);

    // Register user
    const result = await registerUser(validatedInput);

    res.status(201).json(result);
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

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate input
    const validatedInput = loginSchema.parse(req.body);

    // Login user
    const result = await loginUser(validatedInput);

    res.status(200).json(result);
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

