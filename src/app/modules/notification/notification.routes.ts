import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { notificationController } from "./notification.controller";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  notificationController.getMyNotifications,
);

router.get(
  "/unread-count",
  notificationController.getUnreadCount,
);

router.patch(
  "/:id/read",
  notificationController.markAsRead,
);

router.patch(
  "/read-all",
  notificationController.markAllAsRead,
);

export const notificationRoutes = router;