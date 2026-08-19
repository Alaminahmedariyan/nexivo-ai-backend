import { z } from "zod";

const createProjectSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),

  title: z
    .string({ error: "Title is required" })
    .min(2, "Title must be at least 2 characters")
    .max(150, "Title cannot exceed 150 characters"),

  description: z
    .string({ error: "Description is required" })
    .min(10, "Description must be at least 10 characters"),

  startDate: z.coerce.date().optional(),

  dueDate: z.coerce.date().optional(),

  budget: z.number().positive().optional(),

  currency: z
    .enum(["USD", "EUR", "BDT"])
    .default("USD"),
});

const updateProjectSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(150)
    .optional(),

  description: z
    .string()
    .min(10)
    .optional(),

  status: z
    .enum([
      "PLANNING",
      "IN_PROGRESS",
      "REVIEW",
      "COMPLETED",
      "ON_HOLD",
      "CANCELLED",
    ])
    .optional(),

  startDate: z.coerce.date().optional(),

  dueDate: z.coerce.date().optional(),

  budget: z.number().positive().optional(),

  currency: z
    .enum(["USD", "EUR", "BDT"])
    .optional(),
});

const addMemberSchema = z.object({
  /*
   * Better Auth generated user IDs may not always be CUID.
   * So keep this as string instead of .cuid().
   */
  userId: z.string().min(1, "User ID is required"),

  projectRole: z
    .enum([
      "LEAD",
      "DEVELOPER",
      "DESIGNER",
      "MANAGER",
    ])
    .default("DEVELOPER"),
});

export const projectValidation = {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
};