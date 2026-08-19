import { Router } from "express";
import { timelineController } from "./timeline.controller";
import { timelineValidation } from "./timeline.validation";
import { validateRequest } from "../../middlewares/validateRequest";

const router = Router({
  mergeParams: true,
});

router.post(
  "/",
  validateRequest(
    timelineValidation.createTimelineEntrySchema,
  ),
  timelineController.createEntry,
);

router.get(
  "/",
  timelineController.getByProject,
);

router.get(
  "/:timelineId",
  timelineController.getById,
);

router.patch(
  "/:timelineId",
  validateRequest(
    timelineValidation.updateTimelineEntrySchema,
  ),
  timelineController.updateEntry,
);

router.delete(
  "/:timelineId",
  timelineController.deleteEntry,
);

export const timelineRoutes = router;