import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { catchAsync } from "../../utils/catchAsync";

import { aiService } from "./ai.service";

import type { AuthenticatedUser } from "../../middlewares/requireAuth";

// ============================================================
// CONVERSATION
// ============================================================

const startConversation = catchAsync(
  async (req: Request, res: Response) => {
    const currentUser =
      req.user as AuthenticatedUser | undefined;

    const conversation =
      await aiService.startConversation({
        ...req.body,

        userId:
          currentUser?.id,
      });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Conversation started.",
      data: conversation,
    });
  },
);

const addMessage = catchAsync(
  async (req: Request, res: Response) => {
    const conversation =
      await aiService.addMessage(
        req.params.id as string,
        req.body,
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Message added.",
      data: conversation,
    });
  },
);

const getConversationById = catchAsync(
  async (req: Request, res: Response) => {
    const conversation =
      await aiService.getConversationById(
        req.params.id as string,
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Conversation retrieved.",
      data: conversation,
    });
  },
);

const getAllConversations = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await aiService.getAllConversations(
        req.query as Record<string, unknown>,
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Conversations retrieved.",
      meta: result.meta,
      data: result.data,
    });
  },
);

// ============================================================
// PROPOSAL
// ============================================================

const createProposal = catchAsync(
  async (req: Request, res: Response) => {
    const currentUser =
      req.user as AuthenticatedUser;

    const proposal =
      await aiService.createProposal(
        req.body,
        currentUser.id,
      );

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Proposal created.",
      data: proposal,
    });
  },
);

const updateProposalStatus = catchAsync(
  async (req: Request, res: Response) => {
    const proposal =
      await aiService.updateProposalStatus(
        req.params.id as string,
        req.body,
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Proposal status updated.",
      data: proposal,
    });
  },
);

const acceptProposal = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await aiService.acceptProposal(
        req.params.id as string,
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message:
        "Proposal accepted and invoice generated.",
      data: result,
    });
  },
);

const getProposalById = catchAsync(
  async (req: Request, res: Response) => {
    const proposal =
      await aiService.getProposalById(
        req.params.id as string,
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Proposal retrieved.",
      data: proposal,
    });
  },
);

const getAllProposals = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await aiService.getAllProposals(
        req.query as Record<string, unknown>,
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Proposals retrieved.",
      meta: result.meta,
      data: result.data,
    });
  },
);

// ============================================================
// USAGE LOG
// ============================================================

const getAllUsageLogs = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await aiService.getAllUsageLogs(
        req.query as Record<string, unknown>,
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "AI usage logs retrieved.",
      meta: result.meta,
      data: result.data,
    });
  },
);

// ============================================================
// AUTOMATION
// ============================================================

const logAutomationExecution = catchAsync(
  async (req: Request, res: Response) => {
    const execution =
      await aiService.logAutomationExecution(
        req.body,
      );

    res.status(StatusCodes.CREATED).json({
      success: true,
      message:
        "Automation execution logged.",
      data: execution,
    });
  },
);

const getAllAutomationExecutions = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await aiService.getAllAutomationExecutions(
        req.query as Record<string, unknown>,
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message:
        "Automation executions retrieved.",
      meta: result.meta,
      data: result.data,
    });
  },
);

// ============================================================
// EXPORT
// ============================================================

export const aiController = {
  startConversation,
  addMessage,
  getConversationById,
  getAllConversations,

  createProposal,
  updateProposalStatus,
  acceptProposal,
  getProposalById,
  getAllProposals,

  getAllUsageLogs,

  logAutomationExecution,
  getAllAutomationExecutions,
};