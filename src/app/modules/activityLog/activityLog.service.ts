import { prisma } from "../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";

import { QueryBuilder } from "../../query-builder";

import {
  ACTIVITY_LOG_SEARCHABLE_FIELDS,
  ACTIVITY_LOG_FILTERABLE_FIELDS,
  ACTIVITY_LOG_SORTABLE_FIELDS,
  ACTIVITY_LOG_SELECT,
  ACTIVITY_LOG_DEFAULT_SORT,
} from "./activityLog.const";

import type { LogActivityInput } from "./activityLog.interface";

// ======================================================
// CREATE ACTIVITY LOG
// ======================================================

const logActivity = async (
  payload: LogActivityInput,
) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId: payload.userId,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId,
        metadata:
          payload.metadata as
            | Prisma.InputJsonValue
            | undefined,
      },
    });
  } catch (error) {
    // Activity log fail korleo main operation break korbe na
    console.error(
      "[ActivityLog] Failed to write activity log:",
      error,
    );
  }
};

// ======================================================
// GET ACTIVITY LOGS
// ======================================================

const getActivityLogs = async (
  queryParams: Record<string, unknown>,
) => {
  // ====================================================
  // QUERY BUILDER
  // ====================================================

  const activityLogQuery = new QueryBuilder(
    prisma.activityLog,
    {
      // SEARCH
      searchableFields: [
        ...ACTIVITY_LOG_SEARCHABLE_FIELDS,
      ],

      // FILTER
      filterableFields: {
        ...ACTIVITY_LOG_FILTERABLE_FIELDS,
      },

      // SORT
      sortableFields: [
        ...ACTIVITY_LOG_SORTABLE_FIELDS,
      ],

      // SELECT
      selectableFields: Object.keys(
        ACTIVITY_LOG_SELECT,
      ),

      // DEFAULT SORT
      defaultSortField:
        ACTIVITY_LOG_DEFAULT_SORT,
    },
  );

  // ====================================================
  // EXECUTE QUERY
  // ====================================================

  const result = await activityLogQuery.execute(
    queryParams,
  );

  // ====================================================
  // NO DATA
  // ====================================================

  if (result.data.length === 0) {
    return {
      data: [],
      meta: result.meta,
    };
  }

  // ====================================================
  // USER IDS
  // ====================================================

  const userIds = [
    ...new Set(
      result.data
        .map((log) => log.userId)
        .filter(
          (id): id is string =>
            Boolean(id),
        ),
    ),
  ];

  // ====================================================
  // USERS
  // ====================================================

  const users =
    userIds.length > 0
      ? await prisma.user.findMany({
          where: {
            id: {
              in: userIds,
            },
          },

          select: {
            id: true,
            name: true,
            email: true,
          },
        })
      : [];

  // ====================================================
  // USER MAP
  // ====================================================

  const userMap = new Map(
    users.map((user) => [
      user.id,
      user,
    ]),
  );

  // ====================================================
  // FINAL DATA
  // ====================================================

  const data = result.data.map((log) => ({
    ...log,

    user: log.userId
      ? userMap.get(log.userId) ?? null
      : null,
  }));

  // ====================================================
  // RETURN
  // ====================================================

  return {
    data,
    meta: result.meta,
  };
};

// ======================================================
// EXPORT
// ======================================================

export const activityLogService = {
  logActivity,
  getActivityLogs,
};