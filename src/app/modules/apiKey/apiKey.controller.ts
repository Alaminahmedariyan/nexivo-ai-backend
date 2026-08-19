import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";

import type { AuthenticatedUser } from "../../middlewares/requireAuth";
import { apiKeyService } from "./apiKey.service";

const createApiKey = catchAsync(async (req: Request, res: Response) => {
  const currentUser = req.user as AuthenticatedUser;
  const apiKey = await apiKeyService.createApiKey(req.body, currentUser.id);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "API key created. Copy it now — the raw key will never be shown again.",
    data: apiKey,
  });
});

const getAllApiKeys = catchAsync(async (_req: Request, res: Response) => {
  const apiKeys = await apiKeyService.getAllApiKeys();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "API keys retrieved successfully.",
    data: apiKeys,
  });
});

const revokeApiKey = catchAsync(async (req: Request, res: Response) => {
  const currentUser = req.user as AuthenticatedUser;
  const apiKey = await apiKeyService.revokeApiKey(req.params.id as string, currentUser.id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "API key revoked successfully.",
    data: apiKey,
  });
});

const hardDeleteApiKey = catchAsync(async (req: Request, res: Response) => {
  const currentUser = req.user as AuthenticatedUser;
  await apiKeyService.hardDeleteApiKey(req.params.id as string, currentUser.id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "API key permanently deleted.",
    data: null,
  });
});

export const apiKeyController = {
  createApiKey,
  getAllApiKeys,
  revokeApiKey,
  hardDeleteApiKey,
};