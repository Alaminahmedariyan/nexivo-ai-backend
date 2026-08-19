import { Router } from "express";
import { projectFileUpload } from "../../config/upload";
import { projectFileController } from "./projectFile.controller";

// ======================================================
// ROUTER
// ======================================================

const router = Router({
  mergeParams: true,
});

// Parent project router already applies:
// requireAuth + requireRole

// POST /projects/:projectId/files
router.post(
  "/",
  projectFileUpload.single("file"),
  projectFileController.uploadFile,
);

// GET /projects/:projectId/files
router.get(
  "/",
  projectFileController.getFilesByProject,
);

// DELETE /projects/:projectId/files/:fileId
router.delete(
  "/:fileId",
  projectFileController.deleteFile,
);

export const projectFileRoutes = router;