import { Router } from "express";

import {
  requireAuth,
  requireRole,
} from "../../middlewares/requireAuth";

import { validateRequest } from "../../middlewares/validateRequest";

import { projectController } from "./project.controller";
import { projectValidation } from "./project.validation";

import { milestoneRoutes } from "../milestone/milestone.routes";
import { timelineRoutes } from "../timeline/timeline.routes";
import { projectFileRoutes } from "../projectFile/projectFile.routes";

const router = Router();

/* =========================================================
   AUTHENTICATION
========================================================= */

router.use(requireAuth);


/* =========================================================
   ADMIN / TEAM PROJECT MANAGEMENT
========================================================= */

router.post(
  "/",
  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
    "TEAM_MEMBER",
  ),
  validateRequest(
    projectValidation.createProjectSchema,
  ),
  projectController.createProject,
);


/* =========================================================
   GET ALL PROJECTS

   ADMIN / SUPER_ADMIN / TEAM_MEMBER
   → all projects

   CLIENT
   → only own projects
========================================================= */

router.get(
  "/",
  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
    "TEAM_MEMBER",
    "CLIENT",
  ),
  projectController.getAllProjects,
);


/* =========================================================
   GET PROJECT BY ID

   ADMIN / SUPER_ADMIN / TEAM_MEMBER
   → any project

   CLIENT
   → only own project
========================================================= */

router.get(
  "/:id",
  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
    "TEAM_MEMBER",
    "CLIENT",
  ),
  projectController.getProjectById,
);


/* =========================================================
   UPDATE PROJECT

   CLIENT NOT ALLOWED
========================================================= */

router.patch(
  "/:id",
  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
    "TEAM_MEMBER",
  ),
  validateRequest(
    projectValidation.updateProjectSchema,
  ),
  projectController.updateProject,
);


/* =========================================================
   ADD PROJECT MEMBER

   CLIENT NOT ALLOWED
========================================================= */

router.post(
  "/:id/members",
  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
    "TEAM_MEMBER",
  ),
  validateRequest(
    projectValidation.addMemberSchema,
  ),
  projectController.addMember,
);


/* =========================================================
   REMOVE PROJECT MEMBER

   CLIENT NOT ALLOWED
========================================================= */

router.delete(
  "/:id/members/:userId",
  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
    "TEAM_MEMBER",
  ),
  projectController.removeMember,
);


/* =========================================================
   NESTED RESOURCES

   Keep management resources restricted for now.
========================================================= */

router.use(
  "/:projectId/milestones",
  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
    "TEAM_MEMBER",
  ),
  milestoneRoutes,
);

router.use(
  "/:projectId/timeline",
  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
    "TEAM_MEMBER",
  ),
  timelineRoutes,
);

router.use(
  "/:projectId/files",
  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
    "TEAM_MEMBER",
  ),
  projectFileRoutes,
);


/* =========================================================
   DELETE PROJECT

   CLIENT NOT ALLOWED
========================================================= */

router.delete(
  "/:id",
  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
    "TEAM_MEMBER",
  ),
  projectController.deleteProject,
);


export const projectRoutes = router;