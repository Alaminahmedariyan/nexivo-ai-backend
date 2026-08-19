import { z } from "zod";

const createMilestoneSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .min(2, "Title must be at least 2 characters")
    .max(150),

  description: z
    .string()
    .optional(),

  dueDate: z
    .coerce
    .date()
    .optional(),

  order: z
    .number()
    .int()
    .nonnegative()
    .optional(),
});

const updateMilestoneSchema = z
  .object({
    title: z
      .string()
      .min(2)
      .max(150)
      .optional(),

    description: z
      .string()
      .optional(),

    dueDate: z
      .coerce
      .date()
      .optional(),

    status: z
      .enum([
        "PENDING",
        "IN_PROGRESS",
        "COMPLETED",
      ])
      .optional(),

    order: z
      .number()
      .int()
      .nonnegative()
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for update.",
    },
  );

export const milestoneValidation = {
  createMilestoneSchema,
  updateMilestoneSchema,
};