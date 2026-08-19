import { Prisma } from "../../../../generated/prisma/client";
import { InvoiceStatus, ProjectCurrency } from "../../../../generated/prisma/enums";
import type { FilterConfig } from "../../query-builder/types";

export const INVOICE_SELECT = {
  id: true,
  invoiceNumber: true,
  clientId: true,
  projectId: true,
  milestoneId: true,
  items: true,
  subtotal: true,
  tax: true,
  total: true,
  currency: true,
  status: true,
  dueDate: true,
  issuedAt: true,
  paidAt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.InvoiceSelect;

export const INVOICE_SEARCHABLE_FIELDS = [
  "invoiceNumber",
  "notes",
  "client.companyName",
] as const;

export const INVOICE_FILTERABLE_FIELDS: Record<string, FilterConfig> = {
  clientId: "string",
  projectId: "string",
  milestoneId: "string",
  status: { type: "enum", enum: InvoiceStatus },
  currency: { type: "enum", enum: ProjectCurrency },
  dueDate: "date",
  createdAt: "date",
};

export const INVOICE_SORTABLE_FIELDS = [
  "createdAt",
  "dueDate",
  "total",
  "status",
  "invoiceNumber",
] as const;

export const INVOICE_DEFAULT_SORT = "createdAt";