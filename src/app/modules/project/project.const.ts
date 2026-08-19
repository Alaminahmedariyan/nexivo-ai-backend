import { Prisma } from "../../../../generated/prisma/client";
import { ProjectCurrency, ProjectStatus } from "../../../../generated/prisma/enums";
import type { FilterConfig } from "../../query-builder/types";

export const PROJECT_SELECT = {
  id: true,
  clientId: true,
  title: true,
  description: true,
  status: true,
  startDate: true,
  dueDate: true,
  budget: true,
  currency: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProjectSelect;

export const PROJECT_SEARCHABLE_FIELDS: string[] = [
  "title",
  "description",
  "client.companyName",
];

export const PROJECT_FILTERABLE_FIELDS: Record<string, FilterConfig> = {
  clientId: "string",

  status: {
    type: "enum",
    enum: ProjectStatus,
  },

  currency: {
    type: "enum",
    enum: ProjectCurrency,
  },

  createdAt: "date",
};

export const PROJECT_SORTABLE_FIELDS: string[] = [
  "createdAt",
  "title",
  "status",
  "dueDate",
  "budget",
];

export const PROJECT_DEFAULT_SORT = "createdAt";