import bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '../config/prisma';
import env from '../config/env';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../validators/authValidator';
import { CustomError } from '../middleware/errorHandler';

const SALT_ROUNDS = parseInt(env.BCRYPT_SALT_ROUNDS, 10);

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  access_token: string;
  refresh_token: string;
}

export const registerUser = async (input: RegisterInput): Promise<AuthResponse> => {
  // Hash password
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  try {
    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase().trim(),
        passwordHash,
        username: input.username.trim(),
        role: 'consumer', // Default role
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = generateAccessToken(tokenPayload);
    const refresh_token = generateRefreshToken(tokenPayload);

    return {
      user,
      access_token,
      refresh_token,
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        const field = error.meta?.target as string[];
        if (field?.includes('email')) {
          throw new CustomError('Email already registered', 409);
        }
        if (field?.includes('username')) {
          throw new CustomError('Username already taken', 409);
        }
      }
    }
    throw error;
  }
};

export const loginUser = async (input: LoginInput): Promise<AuthResponse> => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: {
      email: input.email.toLowerCase().trim(),
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new CustomError('Invalid email or password', 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new CustomError('Invalid email or password', 401);
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const access_token = generateAccessToken(tokenPayload);
  const refresh_token = generateRefreshToken(tokenPayload);

  // Remove password hash from response
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    access_token,
    refresh_token,
  };
};

