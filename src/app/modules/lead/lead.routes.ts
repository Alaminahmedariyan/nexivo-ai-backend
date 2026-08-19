import { Router } from "express";
import { publicRateLimiter } from "../../middlewares/publicRateLimiter";
import { requireAuth, requireRole } from "../../middlewares/requireAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { leadController } from "./lead.controller";
import { leadValidation } from "./lead.validation";

const router = Router();

// PUBLIC: Create Lead
router.post(
  "/",
  publicRateLimiter,
  validateRequest(leadValidation.createLeadSchema),
  leadController.createLead
);

// PROTECTED: Internal Lead Management
router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "TEAM_MEMBER"),
  leadController.getAllLeads
);

router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "TEAM_MEMBER"),
  leadController.getLeadById
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "TEAM_MEMBER"),
  validateRequest(leadValidation.updateLeadStatusSchema),
  leadController.updateLeadStatus
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "TEAM_MEMBER"),
  validateRequest(leadValidation.updateLeadSchema),
  leadController.updateLead
);

router.post(
  "/:id/convert",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "TEAM_MEMBER"),
  leadController.convertLeadToClient
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  leadController.deleteLead
);

export const leadRoutes = router;