import { Router } from "express";
import { milestoneController } from "./milestone.controller";
import { milestoneValidation } from "./milestone.validation";
import { validateRequest } from "../../middlewares/validateRequest";

const router = Router({
  mergeParams: true,
});

// ============================================================
// CREATE
// POST /projects/:projectId/milestones
// ============================================================

router.post(
  "/",
  validateRequest(milestoneValidation.createMilestoneSchema),
  milestoneController.createMilestone,
);

// ============================================================
// GET ALL
// GET /projects/:projectId/milestones
//
// QueryBuilder supported:
// ?page=1
// ?limit=10
// ?searchTerm=design
// ?status=COMPLETED
// ?sortBy=order
// ?sortOrder=asc
// ============================================================

router.get(
  "/",
  milestoneController.getMilestonesByProject,
);

// ============================================================
// GET SINGLE
// GET /projects/:projectId/milestones/:milestoneId
// ============================================================

router.get(
  "/:milestoneId",
  milestoneController.getMilestoneById,
);

// ============================================================
// UPDATE
// PATCH /projects/:projectId/milestones/:milestoneId
// ============================================================

router.patch(
  "/:milestoneId",
  validateRequest(milestoneValidation.updateMilestoneSchema),
  milestoneController.updateMilestone,
);

// ============================================================
// DELETE
// DELETE /projects/:projectId/milestones/:milestoneId
// ============================================================

router.delete(
  "/:milestoneId",
  milestoneController.deleteMilestone,
);

export const milestoneRoutes = router;