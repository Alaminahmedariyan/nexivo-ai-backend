import { z } from "zod";

const createTimelineEntrySchema = z.object({
  title: z
    .string({ message: "Title is required" })
    .min(2)
    .max(150),

  description: z
    .string()
    .optional(),

  statusDate: z
    .coerce
    .date()
    .optional(),
});

const updateTimelineEntrySchema = createTimelineEntrySchema.partial();

export const timelineValidation = {
  createTimelineEntrySchema,
  updateTimelineEntrySchema,
};