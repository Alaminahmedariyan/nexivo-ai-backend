import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/requireAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { invoiceController } from "./invoice.controller";
import { invoiceValidation } from "./invoice.validation";

const router = Router();

router.use(requireAuth);

// Client-portal — the first real use of UserRole.CLIENT in this codebase.
router.get("/my", requireRole("CLIENT"), invoiceController.getMyInvoices);

// Internal management
router.use(requireRole("ADMIN", "SUPER_ADMIN", "TEAM_MEMBER"));

router.post("/", validateRequest(invoiceValidation.createInvoiceSchema), invoiceController.createInvoice);
router.get("/", invoiceController.getAllInvoices);
// router.get("/:id", invoiceController.getInvoiceById);
// router.patch("/:id/status", invoiceController.updateInvoice);
router.patch("/:id", validateRequest(invoiceValidation.updateInvoiceSchema), invoiceController.updateInvoice);
router.patch("/:id/send", invoiceController.sendInvoice);
router.patch("/:id/cancel", invoiceController.cancelInvoice);
router.delete("/:id", invoiceController.deleteInvoice);

export const invoiceRoutes = router;