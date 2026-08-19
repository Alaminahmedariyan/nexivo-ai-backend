import type { ProjectCurrency } from "../../../../generated/prisma";

export type InvoiceItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type CreateInvoiceInput = {
  clientId: string;
  projectId?: string;
  milestoneId?: string;
  items: InvoiceItemInput[];
  taxRate?: number; // percentage, e.g. 15 for 15%
  currency?: ProjectCurrency;
  dueDate?: Date;
  notes?: string;
};

export type UpdateInvoiceInput = Partial<{
  items: InvoiceItemInput[];
  taxRate: number;
  currency: ProjectCurrency;
  dueDate: Date;
  notes: string;
}>;
