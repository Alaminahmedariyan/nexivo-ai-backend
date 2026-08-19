import rateLimit from "express-rate-limit";
import { StatusCodes } from "http-status-codes";

// Applies to public, unauthenticated WRITE endpoints (lead submission,
// newsletter signup, registration, forgot-password) — these have no auth
// gate, so they're the easiest targets for spam/abuse bots.
export const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // 20 submissions per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: "Too many requests. Please try again later.",
  },
});