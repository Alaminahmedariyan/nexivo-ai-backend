import { NotificationType, NotificationEntityType } from "../../../../generated/prisma/enums";

export const NOTIFICATION_SELECT = {
  id: true,
  userId: true,
  title: true,
  message: true,
  type: true,
  entityType: true,
  entityId: true,
  link: true,
  isRead: true,
  readAt: true,
  createdAt: true,
} as const;

export const NOTIFICATION_SEARCHABLE_FIELDS = [
  "title",
  "message",
] as const;

export const NOTIFICATION_FILTERABLE_FIELDS = {
  userId: "string",
  isRead: "boolean",
  type: {
    type: "enum",
    enum: NotificationType, // schema: LEAD | PROJECT | SYSTEM | AI
  },
  entityType: {
    type: "enum",
    enum: NotificationEntityType, // schema: LEAD | PROJECT | MILESTONE | CLIENT | PROPOSAL
  },
} as const;

export const NOTIFICATION_SORTABLE_FIELDS = [
  "createdAt",
  "readAt",
  "title",
] as const;

export const NOTIFICATION_DEFAULT_SORT = "createdAt";