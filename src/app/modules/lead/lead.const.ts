import {
  LeadStatus,
  BudgetRange,
  LeadSource,
} from "../../../../generated/prisma/enums";

export const LEAD_PUBLIC_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  company: true,
  serviceId: true,
  message: true,
  budget: true,
  source: true,
  status: true,
  assignedToId: true,
  convertedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ======================================================
// SEARCH
// ======================================================

export const LEAD_SEARCHABLE_FIELDS = [
  "name",
  "email",
  "phone",
  "company",
  "message",
] as const;

// ======================================================
// FILTER
// ======================================================

export const LEAD_FILTERABLE_FIELDS = {
  status: {
    type: "enum",
    enum: LeadStatus,
  },

  budget: {
    type: "enum",
    enum: BudgetRange,
  },

  source: {
    type: "enum",
    enum: LeadSource,
  },

  assignedToId: "string",

  serviceId: "string",

  createdAt: "date",
} as const;

// ======================================================
// SORT
// ======================================================

export const LEAD_SORTABLE_FIELDS = [
  "createdAt",
  "name",
  "email",
  "company",
  "status",
] as const;

export const LEAD_DEFAULT_SORT = "createdAt";