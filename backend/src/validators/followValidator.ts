import { z } from 'zod';

export const followUserSchema = z.object({
  followee_id: z.string().uuid('Invalid user ID format'),
});

export const approveDenyRequestSchema = z.object({
  request_id: z.string().uuid('Invalid request ID format'),
});

export type FollowUserInput = z.infer<typeof followUserSchema>;

