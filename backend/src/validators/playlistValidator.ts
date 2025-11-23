import { z } from 'zod';

export const createPlaylistSchema = z.object({
  title: z.string().min(1).max(255, 'Title must be 255 characters or less'),
  description: z.string().optional(),
  cover_image_url: z.string().url().optional(),
  spot_ids: z.array(z.string().uuid('Invalid spot ID format')).default([]),
});

export const updatePlaylistSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  cover_image_url: z.string().url().optional(),
});

export const addRemoveSpotSchema = z.object({
  action: z.enum(['add', 'remove'], {
    errorMap: () => ({ message: 'Action must be "add" or "remove"' }),
  }),
  spot_id: z.string().uuid('Invalid spot ID format'),
  display_order: z.number().int().min(0).optional(),
});

export type CreatePlaylistInput = z.infer<typeof createPlaylistSchema>;
export type UpdatePlaylistInput = z.infer<typeof updatePlaylistSchema>;
export type AddRemoveSpotInput = z.infer<typeof addRemoveSpotSchema>;

