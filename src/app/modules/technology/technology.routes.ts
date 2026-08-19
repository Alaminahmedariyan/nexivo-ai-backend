import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/requireAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { technologyController } from "./technology.controller";
import { technologyValidation } from "./technology.validation";

const router = Router();

router.get("/", technologyController.getAllTechnologies); // public — used in portfolio filters

router.use(requireAuth, requireRole("ADMIN", "SUPER_ADMIN"));
router.post("/", validateRequest(technologyValidation.createTechnologySchema), technologyController.createTechnology);
router.patch("/:id", validateRequest(technologyValidation.updateTechnologySchema), technologyController.updateTechnology);
router.delete("/:id", technologyController.deleteTechnology);

export const technologyRoutes = router;