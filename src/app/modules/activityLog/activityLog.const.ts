import { Prisma } from "../../../../generated/prisma/client";
import type { FilterConfig } from "../../query-builder/types";

// ======================================================
// SELECT
// ======================================================

export const ACTIVITY_LOG_SELECT = {
  id: true,
  userId: true,
  action: true,
  entityType: true,
  entityId: true,
  metadata: true,
  createdAt: true,
} satisfies Prisma.ActivityLogSelect;

// ======================================================
// SEARCHABLE FIELDS
// ======================================================

export const ACTIVITY_LOG_SEARCHABLE_FIELDS = [
  "entityId",
  "user.name",
  "user.email",
] as const;

// ======================================================
// FILTERABLE FIELDS
// ======================================================

export const ACTIVITY_LOG_FILTERABLE_FIELDS: Record<
  string,
  FilterConfig
> = {
  // ------------------------------------------
  // Action
  // ------------------------------------------

  action: {
    type: "enum",

    enum: {
      CREATED: "created",
      UPDATED: "updated",
      DELETED: "deleted",
      STATUS_CHANGED: "status_changed",
    },
  },

  // ------------------------------------------
  // Entity Type
  // ------------------------------------------

  entityType: {
    type: "enum",

    enum: {
      LEAD: "Lead",
      CLIENT: "Client",
      PROJECT: "Project",
      MILESTONE: "Milestone",
      TIMELINE: "Timeline",
      USER: "User",
      NOTIFICATION: "Notification",
      PROJECT_FILE: "ProjectFile",
    },
  },
};

// ======================================================
// SORTABLE FIELDS
// ======================================================

export const ACTIVITY_LOG_SORTABLE_FIELDS = [
  "createdAt",
  "action",
  "entityType",
] as const;

// ======================================================
// DEFAULT SORT
// ======================================================

export const ACTIVITY_LOG_DEFAULT_SORT = "createdAt";