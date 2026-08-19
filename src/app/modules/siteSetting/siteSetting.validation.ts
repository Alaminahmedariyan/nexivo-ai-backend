import { z } from "zod";

const upsertSettingSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
  group: z.enum(["GENERAL", "SEO", "SOCIAL", "CONTACT"]).optional(),
});

export const siteSettingValidation = { upsertSettingSchema };