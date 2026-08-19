import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  Application,
  NextFunction,
  Request,
  Response,
} from "express";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";

import config from "./app/config";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import { globalRoutes } from "./app/routes";
import { paymentController } from "./app/modules/payment/payment.controller";
import { auth } from "./lib/auth";
import { prisma } from "./lib/prisma";

const app: Application = express();

app.use(helmet());

/**
 * Structured request logging.
 * Logs method, path, status code, and response time.
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;

    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`,
    );
  });

  next();
});

/**
 * CORS configuration.
 */
app.use(
  cors({
    origin: config.app.clientUrl,
    credentials: true,
  }),
);

/**
 * Stripe webhook must receive the raw request body
 * so Stripe signature verification can work correctly.
 *
 * IMPORTANT:
 * This route must be registered before express.json().
 */
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentController.stripeWebhook,
);

/**
 * Better Auth routes.
 */
app.all("/api/auth/*splat", toNodeHandler(auth));

/**
 * Normal JSON request parser.
 */
app.use(express.json());

/**
 * URL-encoded request parser.
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Cookie parser.
 */
app.use(cookieParser());

/**
 * Root health endpoint.
 */
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Nexivo AI API is running.",
  });
});

/**
 * Database health check.
 */
app.get("/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      status: "healthy",
      database: "connected",
    });
  } catch (error) {
    console.error("Health check failed:", error);

    res.status(503).json({
      success: false,
      status: "unhealthy",
      database: "disconnected",
    });
  }
});

/**
 * Main API routes.
 */
app.use("/api/v1", globalRoutes);

/**
 * 404 handler.
 */
app.use(notFound);

/**
 * Global error handler.
 */
app.use(globalErrorHandler);

export default app;