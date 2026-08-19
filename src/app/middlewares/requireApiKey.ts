import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import AppError from "../errors/appError";
import { prisma } from "../../lib/prisma";
import { hashApiKey } from "../utils/apiKey";
import { catchAsync } from "../utils/catchAsync";

// For machine-to-machine callers (n8n, LangFlow, Zapier, etc.) that can't
// hold a browser session cookie. Reads the raw key from the `x-api-key`
// header, hashes it, and looks it up — the raw key itself is never
// stored, so a leaked database can't be used to forge keys.
export const requireApiKey = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const rawKey = req.header("x-api-key");

    if (!rawKey) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Missing x-api-key header.");
    }

    const keyHash = hashApiKey(rawKey);
    const apiKey = await prisma.apiKey.findUnique({ where: { keyHash } });

    if (!apiKey || !apiKey.isActive) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid or revoked API key.");
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "This API key has expired.");
    }

    // Fire-and-forget — a slow/failed lastUsedAt write should never block
    // the actual request the key was authenticating.
    prisma.apiKey
      .update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })
      .catch((error) => console.error("[ApiKey] Failed to update lastUsedAt:", error));

    req.apiKeyName = apiKey.name;
    next();
  },
);