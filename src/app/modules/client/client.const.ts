import { Prisma } from "../../../../generated/prisma/client";

export const CLIENT_SELECT = {
  id: true,
  companyName: true,
  userId: true,
  leadId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ClientSelect;

export type ClientPayload = Prisma.ClientGetPayload<{
  select: typeof CLIENT_SELECT;
}>;

export const CLIENT_SEARCHABLE_FIELDS = [
  "companyName",
  "lead.name",
  "lead.email",
] as const;

export const CLIENT_FILTERABLE_FIELDS = {
  userId: "string",
  leadId: "string",
  createdAt: "date",
} as const;

export const CLIENT_SORTABLE_FIELDS = [
  "createdAt",
  "companyName",
] as const;

export const CLIENT_DEFAULT_SORT = "createdAt";