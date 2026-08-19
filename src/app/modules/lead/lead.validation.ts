import { z } from "zod";

const createLeadSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),

  email: z
    .string({ message: "Email is required" })
    .email("Invalid email address"),

  phone: z
    .string()
    .max(30, "Phone number is too long")
    .optional(),

  company: z
    .string()
    .max(150, "Company name is too long")
    .optional(),

  serviceId: z
    .string()
    .cuid("Invalid service ID")
    .optional(),

  message: z
    .string({ message: "Message is required" })
    .min(10, "Please tell us a bit more (min 10 characters)")
    .max(5000, "Message is too long"),

  budget: z
    .enum([
      "UNDER_1K",
      "RANGE_1K_5K",
      "RANGE_5K_10K",
      "RANGE_10K_25K",
      "ABOVE_25K",
      "NOT_SURE",
    ])
    .optional(),

  source: z
    .enum([
      "CONTACT_FORM",
      "QUOTE_FORM",
      "ORGANIC",
      "GOOGLE",
      "LINKEDIN",
      "FACEBOOK",
      "REFERRAL",
      "OTHER",
    ])
    .default("CONTACT_FORM"),
});

const updateLeadStatusSchema = z.object({
  status: z.enum([
    "NEW",
    "CONTACTED",
    "QUOTED",
    "MEETING_SCHEDULED",
    "NEGOTIATION",
    "WON",
    "LOST",
  ]),

  assignedToId: z
    .string()
    .cuid("Invalid assigned user ID")
    .optional(),
});

const updateLeadSchema = createLeadSchema.partial();

export const leadValidation = {
  createLeadSchema,
  updateLeadStatusSchema,
  updateLeadSchema,
};