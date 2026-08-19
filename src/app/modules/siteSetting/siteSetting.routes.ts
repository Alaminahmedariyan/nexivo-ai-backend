import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/requireAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { siteSettingController } from "./siteSetting.controller";
import { siteSettingValidation } from "./siteSetting.validation";

const router = Router();

// Public — frontend reads settings (logo, contact info, SEO tags) directly
router.get("/", siteSettingController.getAllSettings);
router.get("/:key", siteSettingController.getSettingByKey);

router.use(requireAuth, requireRole("ADMIN", "SUPER_ADMIN"));
router.put("/", validateRequest(siteSettingValidation.upsertSettingSchema), siteSettingController.upsertSetting);
router.delete("/:key", siteSettingController.deleteSetting);

export const siteSettingRoutes = router;