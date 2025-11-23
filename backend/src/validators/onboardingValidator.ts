import { z } from 'zod';

export const completeOnboardingSchema = z.object({
  followed_creator_ids: z
    .array(z.string().uuid())
    .min(1, 'Must follow at least one creator')
    .max(20, 'Cannot follow more than 20 creators at once'),
});

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;

