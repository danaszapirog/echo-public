import { z } from 'zod';

export const createWantToGoSchema = z.object({
  place_id: z.string().uuid('Invalid place ID format'),
  notes: z.string().optional(),
});

export const updateWantToGoSchema = z.object({
  notes: z.string().optional(),
});

export const convertToSpotSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  photos: z.array(z.string().url()).default([]),
  guided_questions: z.record(z.string(), z.any()).optional(),
});

export type CreateWantToGoInput = z.infer<typeof createWantToGoSchema>;
export type UpdateWantToGoInput = z.infer<typeof updateWantToGoSchema>;
export type ConvertToSpotInput = z.infer<typeof convertToSpotSchema>;

