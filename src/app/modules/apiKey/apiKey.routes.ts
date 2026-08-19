import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/requireAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { apiKeyController } from "./apiKey.controller";
import { apiKeyValidation } from "./apiKey.validation";

const router = Router();

// An API key grants automation tools write access to your data (e.g.
// logging automation runs), so key management as a whole is restricted
// to ADMIN and SUPER_ADMIN only.
router.use(requireAuth, requireRole("ADMIN", "SUPER_ADMIN"));

router.post(
  "/",
  validateRequest(apiKeyValidation.createApiKeySchema),
  apiKeyController.createApiKey,
);

router.get("/", apiKeyController.getAllApiKeys);

// Soft-revoke — any ADMIN/SUPER_ADMIN can do this. Row stays for audit.
router.patch("/:id/revoke", apiKeyController.revokeApiKey);

// Hard-delete — SUPER_ADMIN only (tighter than the router-level ADMIN
// access above), and only works on a key that's already been revoked
// (enforced in apiKey.service.ts). Use for GDPR-style data-removal
// requests or cleaning up long-revoked keys — not a routine action.
router.delete(
  "/:id",
  requireRole("SUPER_ADMIN"),
  apiKeyController.hardDeleteApiKey,
);

export const apiKeyRoutes = router;