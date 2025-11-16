import { z } from 'zod';

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be at most 500 characters')
    .optional(),
  profilePictureUrl: z
    .string()
    .url('Invalid URL format')
    .optional(),
  isPrivate: z
    .boolean()
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

