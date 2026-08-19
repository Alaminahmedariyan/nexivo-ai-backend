import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { notificationService } from "./notification.service";
import type { AuthenticatedUser } from "../../middlewares/requireAuth";

// ======================================================
// GET MY NOTIFICATIONS
// ======================================================

const getMyNotifications = catchAsync(
  async (req: Request, res: Response) => {
    const currentUser =
      req.user as AuthenticatedUser;

    const notifications =
      await notificationService.getMyNotifications(
        currentUser.id,
        req.query,
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message:
        "Notifications retrieved successfully.",
      ...notifications,
    });
  },
);

// ======================================================
// GET UNREAD COUNT
// ======================================================

const getUnreadCount = catchAsync(
  async (req: Request, res: Response) => {
    const currentUser =
      req.user as AuthenticatedUser;

    const count =
      await notificationService.getUnreadCount(
        currentUser.id,
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message:
        "Unread count retrieved successfully.",
      data: {
        count,
      },
    });
  },
);

// ======================================================
// MARK AS READ
// ======================================================

const markAsRead = catchAsync(
  async (req: Request, res: Response) => {
    const currentUser =
      req.user as AuthenticatedUser;

    const notification =
      await notificationService.markAsRead(
        req.params.id as string,
        currentUser.id,
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
    });
  },
);

// ======================================================
// MARK ALL AS READ
// ======================================================

const markAllAsRead = catchAsync(
  async (req: Request, res: Response) => {
    const currentUser =
      req.user as AuthenticatedUser;

    await notificationService.markAllAsRead(
      currentUser.id,
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "All notifications marked as read.",
      data: null,
    });
  },
);

// ======================================================
// EXPORT
// ======================================================

export const notificationController = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};