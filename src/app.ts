import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";

import config from "./app/config";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import { globalRoutes } from "./app/routes";
import { auth } from "./lib/auth";
import { prisma } from "./lib/prisma";
import { toNodeHandler } from "better-auth/node";
import helmet from "helmet";
import { paymentController } from "./app/modules/payment/payment.controller";

const app: Application = express();

app.use(helmet());

// Structured request logging — logs method, path, status code, and
// response time once the response actually finishes, instead of just
// the incoming request line. Much more useful for spotting slow/failing
// endpoints than the old "→ GET /path" pre-request log.
app.use((req: Request, res: Response, next: NextFunction) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);
  });
  next();
});

app.use(
  cors({
    origin: config.app.clientUrl,
    credentials: true,
  }),
);

// Stripe webhook needs the RAW request body for signature verification —
// registered before express.json() for this exact path only.
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentController.stripeWebhook,
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentController.stripeWebhook,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Nexivo AI API is running." });
});

// Health check for uptime monitors / load balancers — confirms both the
// process AND the database connection are alive, not just that Express
// is running (a dead DB connection with a 200 from "/" would be misleading).
app.get("/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ success: true, status: "healthy", database: "connected" });
  } catch {
    res.status(503).json({ success: false, status: "unhealthy", database: "disconnected" });
  }
});

app.use("/api/v1", globalRoutes);
app.use(notFound);
app.use(globalErrorHandler);

export default app;