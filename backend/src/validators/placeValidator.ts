import { z } from 'zod';

export const searchPlacesSchema = z.object({
  q: z.string().min(1, 'Search query is required').optional(),
  lat: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(-90).max(90))
    .optional(),
  lng: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(-180).max(180))
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(50))
    .optional()
    .default('20'),
  radius: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(100).max(100000))
    .optional(),
});

export type SearchPlacesInput = z.infer<typeof searchPlacesSchema>;

