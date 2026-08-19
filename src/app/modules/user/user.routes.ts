import { Router } from "express";

import { requireAuth, requireRole } from "../../middlewares/requireAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { userController } from "./user.controller";
import { userValidation } from "./user.validation";
import { imageUpload } from "../../config/upload";


const router = Router();

router.use(requireAuth);

// Self-service
router.get("/me", userController.getMyProfile);

router.patch(
  "/me",
  imageUpload.single("image"),
  validateRequest(userValidation.updateProfileSchema),
  userController.updateMyProfile,
);

// Admin-only management
router.get(
  "/",
  requireRole("ADMIN", "SUPER_ADMIN"),
  userController.getAllUsers,
);

router.get(
  "/:id",
  requireRole("ADMIN", "SUPER_ADMIN"),
  userController.getUserById,
);

router.patch(
  "/:id/role",
  requireRole("ADMIN", "SUPER_ADMIN"),
  validateRequest(userValidation.updateRoleSchema),
  userController.updateRole,
);

router.patch(
  "/:id/status",
  requireRole("ADMIN", "SUPER_ADMIN"),
  validateRequest(userValidation.updateStatusSchema),
  userController.updateStatus,
);

router.delete(
  "/:id",
  requireRole("SUPER_ADMIN"),
  userController.deleteUser,
);

export const userRoutes = router;