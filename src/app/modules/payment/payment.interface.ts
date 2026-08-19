import type { PaymentMethod } from "../../../../generated/prisma/enums";

export type RecordManualPaymentInput = {
  amount: number;
  method?: PaymentMethod; // BANK_TRANSFER | CASH | OTHER — not STRIPE
  notes?: string;
};