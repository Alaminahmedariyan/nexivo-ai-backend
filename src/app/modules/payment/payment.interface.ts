import type { PaymentMethod } from "../../../../generated/prisma";

export type RecordManualPaymentInput = {
  amount: number;
  method?: PaymentMethod; // BANK_TRANSFER | CASH | OTHER — not STRIPE
  notes?: string;
};
