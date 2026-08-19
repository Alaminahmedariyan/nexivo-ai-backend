import { z } from "zod";

const createTestimonialSchema = z.object({
  clientId: z.string().optional(),

  clientName: z.string().min(2),
  role: z.string().optional(),
  company: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  content: z.string().min(10),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  isFeatured: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
});

const updateTestimonialSchema = z.object({
  clientId: z.string().optional(),

  clientName: z.string().min(2).optional(),
  role: z.string().optional(),
  company: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  content: z.string().min(10).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  isFeatured: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
});

export const testimonialValidation = { createTestimonialSchema, updateTestimonialSchema };