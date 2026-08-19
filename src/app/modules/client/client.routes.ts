import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/requireAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { clientController } from "./client.controller";
import { clientValidation } from "./client.validation";

const router = Router();

// Protect all routes below
router.use(requireAuth);
router.use(requireRole("ADMIN", "SUPER_ADMIN", "TEAM_MEMBER"));

router.post(
  "/",
  validateRequest(clientValidation.createClientSchema),
  clientController.createClient
);

router.get("/", clientController.getAllClients);

router.get("/:id", clientController.getClientById);

router.patch(
  "/:id/link-user",
  validateRequest(clientValidation.linkUserSchema),
  clientController.linkUser
);

router.patch(
  "/:id",
  validateRequest(clientValidation.updateClientSchema),
  clientController.updateClient
);

router.delete("/:id", clientController.deleteClient);

export const clientRoutes = router;