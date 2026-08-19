import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/requireAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { serviceController } from "./service.controller";
import { serviceValidation } from "./service.validation";

const router = Router();

// Public — marketing site
router.get("/", serviceController.getAllServices);
router.get("/slug/:slug", serviceController.getServiceBySlug);

// Admin-only
router.use(requireAuth, requireRole("ADMIN", "SUPER_ADMIN"));

router.post("/", validateRequest(serviceValidation.createServiceSchema), serviceController.createService);
router.get("/:id", serviceController.getServiceById);
router.patch("/:id", validateRequest(serviceValidation.updateServiceSchema), serviceController.updateService);
router.delete("/:id", serviceController.deleteService);

router.post(
  "/:serviceId/packages",
  validateRequest(serviceValidation.createPackageSchema),
  serviceController.addPackage,
);
router.patch(
  "/packages/:packageId",
  validateRequest(serviceValidation.updatePackageSchema),
  serviceController.updatePackage,
);
router.delete("/packages/:packageId", serviceController.deletePackage);

export const serviceRoutes = router;