import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../../middlewares/requireAuth";

import { activityLogController } from "./activityLog.controller";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  activityLogController.getActivityLogs,
);

export const activityLogRoutes = router;