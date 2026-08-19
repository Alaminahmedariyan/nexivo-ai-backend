import { MilestoneStatus } from "../../../../generated/prisma/enums";

export const MILESTONE_SEARCHABLE_FIELDS = [
  "title",
  "description",
] as string[];

export const MILESTONE_FILTERABLE_FIELDS = {
  projectId: "string",
  status: {
    type: "enum",
    enum: MilestoneStatus,
  },
  order: "number",
  dueDate: "date",
} as const;

export const MILESTONE_SORTABLE_FIELDS = [
  "order",
  "title",
  "dueDate",
  "createdAt",
  "updatedAt",
] as string[];

export const MILESTONE_DEFAULT_SORT = "order";