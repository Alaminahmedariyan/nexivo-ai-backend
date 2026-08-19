import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/requireAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { portfolioController } from "./portfolio.controller";
import { portfolioValidation } from "./portfolio.validation";

const router = Router();

// Public
router.get("/", portfolioController.getAllPortfolios);
router.get("/slug/:slug", portfolioController.getPortfolioBySlug);

// Admin-only
router.use(requireAuth, requireRole("ADMIN", "SUPER_ADMIN"));

router.post("/", validateRequest(portfolioValidation.createPortfolioSchema), portfolioController.createPortfolio);
router.patch("/:id", validateRequest(portfolioValidation.updatePortfolioSchema), portfolioController.updatePortfolio);
router.delete("/:id", portfolioController.deletePortfolio);

router.post(
  "/:portfolioId/images",
  validateRequest(portfolioValidation.addImageSchema),
  portfolioController.addImage,
);
router.delete("/images/:imageId", portfolioController.removeImage);

router.post("/:portfolioId/technologies/:technologyId", portfolioController.addTechnology);
router.delete("/:portfolioId/technologies/:technologyId", portfolioController.removeTechnology);

export const portfolioRoutes = router;