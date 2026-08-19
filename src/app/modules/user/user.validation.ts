import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  image: z.string().url().optional(),
});

const updateRoleSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "TEAM_MEMBER", "CLIENT", "USER"]),
});

const updateStatusSchema = z.object({
  isActive: z.boolean().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
}).refine(data => data.isActive !== undefined || data.status !== undefined, {
  message: "Either isActive or status must be provided",
});

export const userValidation = { updateProfileSchema, updateRoleSchema, updateStatusSchema };