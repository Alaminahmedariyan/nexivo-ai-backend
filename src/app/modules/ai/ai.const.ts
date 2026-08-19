import { Prisma } from "../../../../generated/prisma/client";

import {
  AIFeature,
  AIUsageStatus,
  AutomationExecutionStatus,
  ProjectCurrency,
  ProposalStatus,
  TriggerType,
} from "../../../../generated/prisma";

import type { FilterConfig } from "../../query-builder/types";

// ============================================================
// AI CONVERSATION
// ============================================================

export const AI_CONVERSATION_SELECT = {
  id: true,
  userId: true,
  leadId: true,
  title: true,
  messages: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AIConversationSelect;

export const AI_CONVERSATION_SEARCHABLE_FIELDS = ["title"] as const;

export const AI_CONVERSATION_FILTERABLE_FIELDS: Record<string, FilterConfig> = {
  userId: "string",
  leadId: "string",
  createdAt: "date",
};

export const AI_CONVERSATION_SORTABLE_FIELDS = [
  "createdAt",
  "updatedAt",
  "title",
] as const;

export const AI_CONVERSATION_DEFAULT_SORT = "updatedAt";

// ============================================================
// AI PROPOSAL
// ============================================================

export const AI_PROPOSAL_SELECT = {
  id: true,
  leadId: true,
  clientId: true,
  title: true,
  content: true,
  amount: true,
  currency: true,
  status: true,
  generatedById: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AIProposalSelect;

export const AI_PROPOSAL_SEARCHABLE_FIELDS = ["title", "content"] as const;

export const AI_PROPOSAL_FILTERABLE_FIELDS: Record<string, FilterConfig> = {
  leadId: "string",

  clientId: "string",

  generatedById: "string",

  status: {
    type: "enum",
    enum: ProposalStatus,
  },

  currency: {
    type: "enum",
    enum: ProjectCurrency,
  },

  createdAt: "date",
};

export const AI_PROPOSAL_SORTABLE_FIELDS = [
  "createdAt",
  "updatedAt",
  "title",
  "status",
  "amount",
] as const;

export const AI_PROPOSAL_DEFAULT_SORT = "createdAt";

// ============================================================
// AI USAGE LOG
// ============================================================

export const AI_USAGE_LOG_SELECT = {
  id: true,
  userId: true,
  feature: true,
  promptTokens: true,
  outputTokens: true,
  cost: true,
  status: true,
  createdAt: true,
} satisfies Prisma.AIUsageLogSelect;

export const AI_USAGE_LOG_SEARCHABLE_FIELDS: string[] = [];

export const AI_USAGE_LOG_FILTERABLE_FIELDS: Record<string, FilterConfig> = {
  userId: "string",

  feature: {
    type: "enum",
    enum: AIFeature,
  },

  status: {
    type: "enum",
    enum: AIUsageStatus,
  },

  createdAt: "date",
};

export const AI_USAGE_LOG_SORTABLE_FIELDS = [
  "createdAt",
  "promptTokens",
  "outputTokens",
  "cost",
] as const;

export const AI_USAGE_LOG_DEFAULT_SORT = "createdAt";

// ============================================================
// AUTOMATION EXECUTION
// ============================================================

export const AUTOMATION_EXECUTION_SELECT = {
  id: true,
  workflowName: true,
  triggerType: true,
  status: true,
  executionTime: true,
  startedAt: true,
  completedAt: true,
  error: true,
  userId: true,
} satisfies Prisma.AutomationExecutionSelect;

export const AUTOMATION_EXECUTION_SEARCHABLE_FIELDS = ["workflowName"] as const;

export const AUTOMATION_EXECUTION_FILTERABLE_FIELDS: Record<
  string,
  FilterConfig
> = {
  workflowName: "string",

  triggerType: {
    type: "enum",
    enum: TriggerType,
  },

  status: {
    type: "enum",
    enum: AutomationExecutionStatus,
  },

  userId: "string",

  startedAt: "date",
};

export const AUTOMATION_EXECUTION_SORTABLE_FIELDS = [
  "startedAt",
  "completedAt",
  "workflowName",
  "status",
] as const;

export const AUTOMATION_EXECUTION_DEFAULT_SORT = "startedAt";
