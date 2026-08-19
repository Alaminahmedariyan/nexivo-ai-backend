import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";
import { authController } from "./auth.controller";
import { loginRateLimiter } from "../../middlewares/rateLimiter";
import { publicRateLimiter } from "../../middlewares/publicRateLimiter";


const router = Router();

router.post(
  "/register",
  publicRateLimiter,
  validateRequest(authValidation.registerSchema),
  authController.register,
);

router.post(
  "/login",
  loginRateLimiter,
  validateRequest(authValidation.loginSchema),
  authController.login,
);

router.post("/logout", requireAuth, authController.logout);

router.post(
  "/forgot-password",
  publicRateLimiter,
  validateRequest(authValidation.forgotPasswordSchema),
  authController.forgotPassword,
);

router.post(
  "/reset-password",
  validateRequest(authValidation.resetPasswordSchema),
  authController.resetPassword,
);

router.post(
  "/change-password",
  requireAuth,
  validateRequest(authValidation.changePasswordSchema),
  authController.changePassword,
);

router.get("/me", requireAuth, authController.getMe);

export const authRoutes = router;