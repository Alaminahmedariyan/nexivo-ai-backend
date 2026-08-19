import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/requireAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { newsletterController } from "./newsletter.controller";
import { newsletterValidation } from "./newsletter.validation";
import { publicRateLimiter } from "../../middlewares/publicRateLimiter";

const router = Router();

router.post(
  "/subscribe",
  publicRateLimiter,
  validateRequest(newsletterValidation.subscribeSchema),
  newsletterController.subscribe,
);

router.post(
  "/unsubscribe",
  publicRateLimiter,
  validateRequest(newsletterValidation.unsubscribeSchema),
  newsletterController.unsubscribe,
);

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  newsletterController.getAllSubscribers,
);

export const newsletterRoutes = router;