import { z } from "zod";

const featureItemSchema = z.object({
  label: z.string(),
  icon: z.string().optional(),
  highlight: z.boolean().optional(),
});

const createServiceSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  icon: z.string().optional(),
  order: z.coerce.number().int().optional(),
});

const updateServiceSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  icon: z.string().optional(),
  order: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

const createPackageSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  features: z.array(featureItemSchema).min(1),
  order: z.coerce.number().int().optional(),
});

const updatePackageSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.coerce.number().nonnegative().optional(),
  features: z.array(featureItemSchema).optional(),
  order: z.coerce.number().int().optional(),
});

export const serviceValidation = {
  createServiceSchema,
  updateServiceSchema,
  createPackageSchema,
  updatePackageSchema,
};