import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";

import { QueryBuilder } from "../../query-builder";

import {
  NOTIFICATION_SEARCHABLE_FIELDS,
  NOTIFICATION_FILTERABLE_FIELDS,
  NOTIFICATION_SORTABLE_FIELDS,
  NOTIFICATION_SELECT,
  NOTIFICATION_DEFAULT_SORT,
} from "./notification.const";

import type { CreateNotificationInput } from "./notification.interface";

// ======================================================
// CREATE NOTIFICATION
// ======================================================

const createNotification = async (
  payload: CreateNotificationInput,
) => {
  try {
    return await prisma.notification.create({
      data: payload,
    });
  } catch (error) {
    console.error(
      "[Notification] Failed to create notification:",
      error,
    );

    // Notification failure should not break
    // the main business operation.
    return null;
  }
};

// ======================================================
// GET MY NOTIFICATIONS
// QueryBuilder
// ======================================================

const getMyNotifications = async (
  userId: string,
  queryParams: Record<string, unknown>,
) => {
  const notificationQuery = new QueryBuilder(
    prisma.notification,
    {
      searchableFields: [
        ...NOTIFICATION_SEARCHABLE_FIELDS,
      ],

      filterableFields: {
        ...NOTIFICATION_FILTERABLE_FIELDS,
      },

      sortableFields: [
        ...NOTIFICATION_SORTABLE_FIELDS,
      ],

      selectableFields: Object.keys(
        NOTIFICATION_SELECT,
      ),

      defaultSortField: NOTIFICATION_DEFAULT_SORT,
    },
  );

  /**
   * IMPORTANT:
   * userId comes from authenticated user,
   * NOT from req.query.
   *
   * Therefore users can only retrieve
   * their own notifications.
   */
  const finalQueryParams: Record<string, unknown> = {
    ...queryParams,
    userId,
  };

  const result = await notificationQuery.execute(
    finalQueryParams,
  );

  return result;
};

// ======================================================
// GET UNREAD COUNT
// ======================================================

const getUnreadCount = async (
  userId: string,
) => {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
};

// ======================================================
// MARK AS READ
// ======================================================

const markAsRead = async (
  id: string,
  userId: string,
) => {
  const existing =
    await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

  if (!existing) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Notification not found.",
    );
  }

  return prisma.notification.update({
    where: { id },

    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

// ======================================================
// MARK ALL AS READ
// ======================================================

const markAllAsRead = async (
  userId: string,
) => {
  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },

    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

// ======================================================
// EXPORT
// ======================================================

export const notificationService = {
  createNotification,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};