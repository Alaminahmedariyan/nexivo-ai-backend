import type { Prisma } from "../../../../generated/prisma/client";

export const TIMELINE_SELECT = {
  id: true,
  projectId: true,
  updatedById: true,
  title: true,
  description: true,
  statusDate: true,
  createdAt: true,
} satisfies Prisma.TimelineSelect;

export const TIMELINE_SEARCHABLE_FIELDS = [
  "title",
  "description",
  "updatedBy.name",
] as const;

export const TIMELINE_FILTERABLE_FIELDS = {
  projectId: "string",
  updatedById: "string",
  statusDate: "date",
} as const;

export const TIMELINE_SORTABLE_FIELDS = [
  "statusDate",
  "createdAt",
  "title",
] as const;

export const TIMELINE_DEFAULT_SORT = "statusDate";