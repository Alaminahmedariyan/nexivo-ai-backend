import { z } from "zod";

const subscribeSchema = z.object({ email: z.string().email() });
const unsubscribeSchema = z.object({ email: z.string().email() });

export const newsletterValidation = { subscribeSchema, unsubscribeSchema };