import { StatusCodes } from "http-status-codes";

import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";

import { Prisma } from "../../../../generated/prisma/client";

import { QueryBuilder } from "../../query-builder";

import {
  AI_CONVERSATION_SEARCHABLE_FIELDS,
  AI_CONVERSATION_FILTERABLE_FIELDS,
  AI_CONVERSATION_SORTABLE_FIELDS,
  AI_CONVERSATION_SELECT,
  AI_CONVERSATION_DEFAULT_SORT,

  AI_PROPOSAL_SEARCHABLE_FIELDS,
  AI_PROPOSAL_FILTERABLE_FIELDS,
  AI_PROPOSAL_SORTABLE_FIELDS,
  AI_PROPOSAL_SELECT,
  AI_PROPOSAL_DEFAULT_SORT,

  AI_USAGE_LOG_SEARCHABLE_FIELDS,
  AI_USAGE_LOG_FILTERABLE_FIELDS,
  AI_USAGE_LOG_SORTABLE_FIELDS,
  AI_USAGE_LOG_SELECT,
  AI_USAGE_LOG_DEFAULT_SORT,

  AUTOMATION_EXECUTION_SEARCHABLE_FIELDS,
  AUTOMATION_EXECUTION_FILTERABLE_FIELDS,
  AUTOMATION_EXECUTION_SORTABLE_FIELDS,
  AUTOMATION_EXECUTION_SELECT,
  AUTOMATION_EXECUTION_DEFAULT_SORT,
} from "./ai.const";

import type {
  StartConversationInput,
  AddMessageInput,
  CreateProposalInput,
  UpdateProposalStatusInput,
  LogUsageInput,
  LogAutomationInput,
} from "./ai.interface";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

// ============================================================
// AI CONVERSATION
// ============================================================

const startConversation = async (payload: StartConversationInput) => {
  const messages: ChatMessage[] = [
    { role: "user", content: payload.message, timestamp: new Date().toISOString() },
  ];

  return prisma.aIConversation.create({
    data: {
      userId: payload.userId,
      leadId: payload.leadId,
      title: payload.title ?? payload.message.slice(0, 60),
      messages: messages as unknown as Prisma.InputJsonValue,
    } satisfies Prisma.AIConversationUncheckedCreateInput,
  });
};

const addMessage = async (
  conversationId: string,
  payload: AddMessageInput,
) => {
  const conversation =
    await prisma.aIConversation.findUnique({
      where: {
        id: conversationId,
      },
    });

  if (!conversation) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Conversation not found.",
    );
  }

  const existingMessages =
    (conversation.messages as unknown as ChatMessage[]) ?? [];

  const updatedMessages: ChatMessage[] = [
    ...existingMessages,

    {
      role: payload.role,
      content: payload.content,
      timestamp: new Date().toISOString(),
    },
  ];

  return prisma.aIConversation.update({
    where: {
      id: conversationId,
    },

    data: {
      messages:
        updatedMessages as unknown as Prisma.InputJsonValue,
    },
  });
};

const getConversationById = async (
  id: string,
) => {
  const conversation =
    await prisma.aIConversation.findUnique({
      where: { id },
    });

  if (!conversation) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Conversation not found.",
    );
  }

  return conversation;
};

const getAllConversations = async (
  query: Record<string, unknown>,
) => {
  const builder = new QueryBuilder(
    prisma.aIConversation,
    {
      searchableFields: [
        ...AI_CONVERSATION_SEARCHABLE_FIELDS,
      ],

      filterableFields:
        AI_CONVERSATION_FILTERABLE_FIELDS,

      sortableFields: [
        ...AI_CONVERSATION_SORTABLE_FIELDS,
      ],

      selectableFields:
        Object.keys(AI_CONVERSATION_SELECT),

      defaultSortField:
        AI_CONVERSATION_DEFAULT_SORT,
    },
  );

  return builder.execute(query);
};

// ============================================================
// AI PROPOSAL
// ============================================================

const createProposal = async (
  payload: CreateProposalInput,
  generatedById: string,
) => {
  return prisma.aIProposal.create({
    data: {
      leadId: payload.leadId,
      clientId: payload.clientId,

      title: payload.title,

      content: payload.content,

      amount: payload.amount,

      currency: payload.currency ?? "USD",

      status: "DRAFT",

      generatedById,
    } satisfies Prisma.AIProposalUncheckedCreateInput,
  });
};

const updateProposalStatus = async (
  id: string,
  payload: UpdateProposalStatusInput,
) => {
  const existing =
    await prisma.aIProposal.findUnique({
      where: { id },
    });

  if (!existing) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Proposal not found.",
    );
  }

  // Don't allow changing an accepted proposal
  // back to another state.
  if (
    existing.status === "ACCEPTED" &&
    payload.status !== "ACCEPTED"
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "An accepted proposal cannot be changed.",
    );
  }

  // Rejected proposal cannot be accepted
  // through this generic status endpoint.
  if (
    existing.status === "REJECTED" &&
    payload.status === "ACCEPTED"
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "A rejected proposal cannot be accepted.",
    );
  }

  return prisma.aIProposal.update({
    where: { id },

    data: {
      status: payload.status,
    },
  });
};

// ============================================================
// ACCEPT PROPOSAL + GENERATE INVOICE
// ============================================================

const acceptProposal = async (
  id: string,
) => {
  return prisma.$transaction(async (tx) => {
    const proposal =
      await tx.aIProposal.findUnique({
        where: { id },
      });

    if (!proposal) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        "Proposal not found.",
      );
    }

    if (proposal.status === "ACCEPTED") {
      throw new AppError(
        StatusCodes.CONFLICT,
        "This proposal has already been accepted.",
      );
    }

    if (proposal.status === "REJECTED") {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "A rejected proposal cannot be accepted.",
      );
    }

    if (!proposal.clientId) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "This proposal has no linked client. Link a client before accepting.",
      );
    }

    if (proposal.amount === null) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "This proposal has no amount set.",
      );
    }

    // --------------------------------------------------------
    // Update proposal
    // --------------------------------------------------------

    const updatedProposal =
      await tx.aIProposal.update({
        where: {
          id,
        },

        data: {
          status: "ACCEPTED",
        },
      });

    // --------------------------------------------------------
    // Generate invoice directly inside transaction
    // --------------------------------------------------------

    const invoiceCount =
      await tx.invoice.count();

    const invoiceNumber =
      `INV-${String(invoiceCount + 1).padStart(6, "0")}`;

    const invoice =
      await tx.invoice.create({
        data: {
          invoiceNumber,

          clientId:
            proposal.clientId,

          items: [
            {
              description:
                proposal.title,

              quantity: 1,

              unitPrice:
                Number(proposal.amount),
            },
          ] as Prisma.InputJsonValue,

          subtotal:
            proposal.amount,

          tax: 0,

          total:
            proposal.amount,

          currency:
            proposal.currency,

          status: "DRAFT",

          notes:
            `Generated automatically from accepted proposal "${proposal.title}".`,
        },

        include: {
          client: true,
        },
      });

    return {
      proposal: updatedProposal,
      invoice,
    };
  });
};

// ============================================================
// GET PROPOSAL
// ============================================================

const getProposalById = async (
  id: string,
) => {
  const proposal =
    await prisma.aIProposal.findUnique({
      where: { id },

      include: {
        lead: true,

        client: true,

        generatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

  if (!proposal) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Proposal not found.",
    );
  }

  return proposal;
};

const getAllProposals = async (
  query: Record<string, unknown>,
) => {
  const builder = new QueryBuilder(
    prisma.aIProposal,
    {
      searchableFields: [
        ...AI_PROPOSAL_SEARCHABLE_FIELDS,
      ],

      filterableFields:
        AI_PROPOSAL_FILTERABLE_FIELDS,

      sortableFields: [
        ...AI_PROPOSAL_SORTABLE_FIELDS,
      ],

      selectableFields:
        Object.keys(AI_PROPOSAL_SELECT),

      defaultSortField:
        AI_PROPOSAL_DEFAULT_SORT,
    },
  );

  return builder.execute(query);
};

// ============================================================
// AI USAGE LOG
// ============================================================

const logUsage = async (
  payload: LogUsageInput,
) => {
  try {
    await prisma.aIUsageLog.create({
      data: {
        userId: payload.userId,

        feature:
          payload.feature,

        promptTokens:
          payload.promptTokens,

        outputTokens:
          payload.outputTokens,

        cost:
          payload.cost,

        status:
          payload.status ?? "SUCCESS",
      } satisfies Prisma.AIUsageLogUncheckedCreateInput,
    });
  } catch (error) {
    console.error(
      "[AIUsageLog] Failed to write usage log:",
      error,
    );
  }
};

const getAllUsageLogs = async (
  query: Record<string, unknown>,
) => {
  const builder = new QueryBuilder(
    prisma.aIUsageLog,
    {
      searchableFields:
        AI_USAGE_LOG_SEARCHABLE_FIELDS,

      filterableFields:
        AI_USAGE_LOG_FILTERABLE_FIELDS,

      sortableFields: [
        ...AI_USAGE_LOG_SORTABLE_FIELDS,
      ],

      selectableFields:
        Object.keys(AI_USAGE_LOG_SELECT),

      defaultSortField:
        AI_USAGE_LOG_DEFAULT_SORT,
    },
  );

  return builder.execute(query);
};

// ============================================================
// AUTOMATION EXECUTION
// ============================================================

const logAutomationExecution = async (
  payload: LogAutomationInput,
) => {
  const isCompleted =
    payload.status &&
    payload.status !== "RUNNING";

  return prisma.automationExecution.create({
    data: {
      workflowName:
        payload.workflowName,

      triggerType:
        payload.triggerType ?? "WEBHOOK",

      status:
        payload.status ?? "RUNNING",

      executionTime:
        payload.executionTime,

      error:
        payload.error,

      userId:
        payload.userId,

      completedAt:
        isCompleted
          ? new Date()
          : undefined,
    } satisfies Prisma.AutomationExecutionUncheckedCreateInput,
  });
};

const getAllAutomationExecutions = async (
  query: Record<string, unknown>,
) => {
  const builder =
    new QueryBuilder(
      prisma.automationExecution,
      {
        searchableFields: [
          ...AUTOMATION_EXECUTION_SEARCHABLE_FIELDS,
        ],

        filterableFields:
          AUTOMATION_EXECUTION_FILTERABLE_FIELDS,

        sortableFields: [
          ...AUTOMATION_EXECUTION_SORTABLE_FIELDS,
        ],

        selectableFields:
          Object.keys(
            AUTOMATION_EXECUTION_SELECT,
          ),

        defaultSortField:
          AUTOMATION_EXECUTION_DEFAULT_SORT,
      },
    );

  return builder.execute(query);
};

// ============================================================
// EXPORT
// ============================================================

export const aiService = {
  startConversation,
  addMessage,
  getConversationById,
  getAllConversations,

  createProposal,
  updateProposalStatus,
  acceptProposal,
  getProposalById,
  getAllProposals,

  logUsage,
  getAllUsageLogs,

  logAutomationExecution,
  getAllAutomationExecutions,
};