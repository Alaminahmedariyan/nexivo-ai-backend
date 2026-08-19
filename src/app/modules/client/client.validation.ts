import { z } from "zod";

const createClientSchema = z.object({
  companyName: z.string().optional(),
  leadId: z.string().optional(),
  userId: z.string().optional(),
});

const linkUserSchema = z.object({
  userId: z.string({ message: "User ID is required" }).min(1),
});

const updateClientSchema = createClientSchema.partial();

export const clientValidation = {
  createClientSchema,
  linkUserSchema,
  updateClientSchema,
};