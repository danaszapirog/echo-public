import { z } from 'zod';

export const createSpotSchema = z.object({
  place_id: z.string().uuid('Invalid place ID format'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  photos: z.array(z.string().url()).default([]),
  guided_questions: z.record(z.string(), z.any()).optional(),
});

export const updateSpotSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  photos: z.array(z.string().url()).optional(),
  guided_questions: z.record(z.string(), z.any()).optional(),
});

export type CreateSpotInput = z.infer<typeof createSpotSchema>;
export type UpdateSpotInput = z.infer<typeof updateSpotSchema>;

