import { Prisma } from "../../../../generated/prisma/client";
import { PaymentMethod, PaymentStatus } from "../../../../generated/prisma";
import type { FilterConfig } from "../../query-builder/types";

export const PAYMENT_SELECT = {
  id: true,
  invoiceId: true,
  amount: true,
  currency: true,
  method: true,
  status: true,
  stripePaymentIntentId: true,
  stripeChargeId: true,
  paidAt: true,
  notes: true,
  createdAt: true,
} satisfies Prisma.PaymentSelect;

export const PAYMENT_SEARCHABLE_FIELDS: string[] = [];

export const PAYMENT_FILTERABLE_FIELDS: Record<string, FilterConfig> = {
  invoiceId: "string",
  method: { type: "enum", enum: PaymentMethod },
  status: { type: "enum", enum: PaymentStatus },
  createdAt: "date",
};

export const PAYMENT_SORTABLE_FIELDS = [
  "createdAt",
  "amount",
  "paidAt",
] as const;
export const PAYMENT_DEFAULT_SORT = "createdAt";
