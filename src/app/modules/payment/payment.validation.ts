import { z } from "zod";

const recordManualPaymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  method: z.enum(["BANK_TRANSFER", "CASH", "OTHER"]).optional(),
  notes: z.string().optional(),
});

const refundPaymentSchema = z.object({
  amount: z.coerce.number().positive().optional(),
});

export const paymentValidation = { recordManualPaymentSchema, refundPaymentSchema };