import { z } from "zod";

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Item description is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unitPrice: z.coerce.number().nonnegative("Unit price cannot be negative"),
});

const createInvoiceSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  projectId: z.string().optional(),
  milestoneId: z.string().optional(),
  items: z.array(invoiceItemSchema).optional().default([{ description: "Service / Milestone Payment", quantity: 1, unitPrice: 1000 }]),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  currency: z.enum(["USD", "EUR", "BDT"]).optional(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

const updateInvoiceSchema = z
  .object({
    items: z.array(invoiceItemSchema).min(1).optional(),
    taxRate: z.coerce.number().min(0).max(100).optional(),
    currency: z.enum(["USD", "EUR", "BDT"]).optional(),
    dueDate: z.coerce.date().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update.",
  });

export const invoiceValidation = { createInvoiceSchema, updateInvoiceSchema };