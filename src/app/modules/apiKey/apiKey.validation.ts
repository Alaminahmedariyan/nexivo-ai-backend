import { z } from "zod";

const createApiKeySchema = z.object({
  name: z
    .string({ error: "Name is required." })
    .trim()
    .min(2, { error: "Name must be at least 2 characters." })
    .max(100, { error: "Name must not exceed 100 characters." }),

  expiresAt: z.coerce
    .date({ error: "Please provide a valid expiration date." })
    .refine((date) => date > new Date(), {
      error: "Expiration date must be in the future.",
    })
    .optional(),
});

export const apiKeyValidation = { createApiKeySchema };