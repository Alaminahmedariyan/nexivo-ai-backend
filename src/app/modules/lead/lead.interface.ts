import type {
  BudgetRange,
  LeadSource,
  LeadStatus,
} from "../../../../generated/prisma";

export type CreateLeadInput = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  serviceId?: string;
  message: string;
  budget?: BudgetRange;
  source?: LeadSource;
};

export type UpdateLeadStatusInput = {
  status: LeadStatus;
  assignedToId?: string;
};
