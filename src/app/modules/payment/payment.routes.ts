import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/requireAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { paymentController } from "./payment.controller";
import { paymentValidation } from "./payment.validation";

const router = Router();

// ------------------------------------------------------------
// Client-portal self-service payment — MUST stay above the
// admin/team-only router.use() below, otherwise a CLIENT user gets
// blocked by that middleware before ever reaching this route.
// Ownership of the invoice is verified inside the controller/service
// (paymentService.createMyStripePaymentIntent), not just the role check.
// ------------------------------------------------------------
router.post(
  "/my/invoices/:invoiceId/intent",
  requireAuth,
  requireRole("CLIENT"),
  paymentController.createMyPaymentIntent,
);

// ------------------------------------------------------------
// Internal management — everything below requires ADMIN/SUPER_ADMIN/TEAM_MEMBER
// ------------------------------------------------------------
router.use(requireAuth, requireRole("ADMIN", "SUPER_ADMIN", "TEAM_MEMBER"));

router.post("/invoices/:invoiceId/intent", paymentController.createPaymentIntent);

// Alias route for Postman collection "create-checkout-session"
router.post("/create-checkout-session", async (req, res) => {
  const { invoiceId } = req.body;
  if (!invoiceId) {
    res.status(400).json({ success: false, message: "invoiceId is required" });
    return;
  }
  const result = await (await import("./payment.service")).paymentService.createStripePaymentIntent(invoiceId as string);
  res.status(201).json({ success: true, message: "Stripe checkout session created.", data: result });
});

router.post(
  "/invoices/:invoiceId/manual",
  validateRequest(paymentValidation.recordManualPaymentSchema),
  paymentController.recordManualPayment,
);
router.get("/invoices/:invoiceId", paymentController.getPaymentsByInvoice);

router.get("/", paymentController.getAllPayments);
router.get("/:id", paymentController.getPaymentById);
router.post(
  "/:id/refund",
  requireRole("ADMIN", "SUPER_ADMIN"),
  validateRequest(paymentValidation.refundPaymentSchema),
  paymentController.refundPayment,
);

export const paymentRoutes = router;