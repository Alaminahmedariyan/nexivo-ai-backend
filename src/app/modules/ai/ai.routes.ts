import { Router } from "express";

import {
  requireAuth,
  requireRole,
} from "../../middlewares/requireAuth";

import { requireApiKey } from "../../middlewares/requireApiKey";

import { validateRequest } from "../../middlewares/validateRequest";

import { publicRateLimiter } from "../../middlewares/publicRateLimiter";

import { aiController } from "./ai.controller";

import { aiValidation } from "./ai.validation";

const router = Router();

// ============================================================
// AI CONVERSATIONS
// ============================================================

// Public AI chat
router.post(
  "/conversations",

  publicRateLimiter,

  validateRequest(
    aiValidation.startConversationSchema,
  ),

  aiController.startConversation,
);

// Add message
router.post(
  "/conversations/:id/messages",

  publicRateLimiter,

  validateRequest(
    aiValidation.addMessageSchema,
  ),

  aiController.addMessage,
);

// Get single conversation
router.get(
  "/conversations/:id",

  aiController.getConversationById,
);

// Admin / team conversation list
router.get(
  "/conversations",

  requireAuth,

  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
    "TEAM_MEMBER",
  ),

  aiController.getAllConversations,
);

// ============================================================
// AI PROPOSALS
// ============================================================

router.use(
  "/proposals",

  requireAuth,

  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
    "TEAM_MEMBER",
  ),
);

router.post(
  "/proposals",

  validateRequest(
    aiValidation.createProposalSchema,
  ),

  aiController.createProposal,
);

router.get(
  "/proposals",

  aiController.getAllProposals,
);

router.get(
  "/proposals/:id",

  aiController.getProposalById,
);

router.patch(
  "/proposals/:id/status",

  validateRequest(
    aiValidation.updateProposalStatusSchema,
  ),

  aiController.updateProposalStatus,
);

router.patch(
  "/proposals/:id/accept",

  aiController.acceptProposal,
);

// ============================================================
// AI USAGE LOGS
// ============================================================

router.get(
  "/usage-logs",

  requireAuth,

  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
  ),

  aiController.getAllUsageLogs,
);

// ============================================================
// AUTOMATION EXECUTIONS
// ============================================================

// n8n / external automation
router.post(
  "/automation-executions",

  requireApiKey,

  validateRequest(
    aiValidation.logAutomationExecutionSchema,
  ),

  aiController.logAutomationExecution,
);

// Admin/team dashboard
router.get(
  "/automation-executions",

  requireAuth,

  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
    "TEAM_MEMBER",
  ),

  aiController.getAllAutomationExecutions,
);

export const aiRoutes = router;