import { z } from "zod";

const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  order: z.coerce.number().int().optional(),
});

const createPortfolioSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  thumbnail: z.string().url().optional().default("https://example.com/thumbnail.png"),
  liveUrl: z.string().url().optional(),
  serviceId: z.string().optional(),
  isFeatured: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
  images: z.array(imageSchema).optional(),
  technologyIds: z.array(z.string()).optional(),
});

const updatePortfolioSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  thumbnail: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  serviceId: z.string().optional(),
  isFeatured: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
});

const addImageSchema = imageSchema;

export const portfolioValidation = { createPortfolioSchema, updatePortfolioSchema, addImageSchema };