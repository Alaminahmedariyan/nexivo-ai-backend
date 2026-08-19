import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/requireAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { testimonialController } from "./testimonial.controller";
import { testimonialValidation } from "./testimonial.validation";

const router = Router();

// Public — marketing site
router.get("/", testimonialController.getAllTestimonials);
router.get("/:id", testimonialController.getTestimonialById);

// Admin-only
router.use(requireAuth, requireRole("ADMIN", "SUPER_ADMIN"));
router.post("/", validateRequest(testimonialValidation.createTestimonialSchema), testimonialController.createTestimonial);
router.patch("/:id", validateRequest(testimonialValidation.updateTestimonialSchema), testimonialController.updateTestimonial);
router.delete("/:id", testimonialController.deleteTestimonial);

export const testimonialRoutes = router;