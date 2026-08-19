import type {
  AIFeature,
  AIUsageStatus,
  AutomationExecutionStatus,
  ProjectCurrency,
  TriggerType,
} from "../../../../generated/prisma/enums";

// ============================================================
// AI CONVERSATION
// ============================================================

export type StartConversationInput = {
  userId?: string
  leadId?: string;
  title?: string;
  message: string;
};

export type AddMessageInput = {
  role: "user" | "assistant";
  content: string;
};

// ============================================================
// AI PROPOSAL
// ============================================================

export type CreateProposalInput = {
  leadId?: string;
  clientId?: string;
  title: string;
  content: string;
  amount: number;
  currency?: ProjectCurrency;
};

export type UpdateProposalStatusInput = {
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED";
};

// ============================================================
// AI USAGE LOG
// ============================================================

export type LogUsageInput = {
  userId?: string;
  feature: AIFeature;
  promptTokens: number;
  outputTokens: number;
  cost?: number;
  status?: AIUsageStatus;
};

// ============================================================
// AUTOMATION EXECUTION
// ============================================================

export type LogAutomationInput = {
  workflowName: string;
  triggerType?: TriggerType;
  status?: AutomationExecutionStatus;
  executionTime?: number;
  error?: string;
  userId?: string;
};