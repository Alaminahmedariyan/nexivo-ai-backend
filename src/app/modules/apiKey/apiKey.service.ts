import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";
import { generateApiKey } from "../../utils/apiKey";
import { activityLogService } from "../activityLog/activityLog.service";
import { API_KEY_SELECT } from "./apiKey.const";
import type { CreateApiKeyInput } from "./apiKey.interface";

// ======================================================
// CREATE
// Returns the raw key ONCE. The caller (admin UI) must show/copy it
// immediately — it can never be retrieved again, only its sha256 hash
// is persisted.
// ======================================================

const createApiKey = async (payload: CreateApiKeyInput, createdById: string) => {
  const { rawKey, keyHash, prefix } = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      name: payload.name,
      keyHash,
      prefix,
      expiresAt: payload.expiresAt,
      createdById,
    } satisfies Prisma.ApiKeyUncheckedCreateInput,
    select: API_KEY_SELECT,
  });

  await activityLogService.logActivity({
    userId: createdById,
    action: "created",
    entityType: "ApiKey",
    entityId: apiKey.id,
    metadata: { name: apiKey.name, prefix: apiKey.prefix },
  });

  return { ...apiKey, key: rawKey };
};

// ======================================================
// READ
// ======================================================

const getAllApiKeys = async () => {
  return prisma.apiKey.findMany({
    select: API_KEY_SELECT,
    orderBy: { createdAt: "desc" },
  });
};

// ======================================================
// REVOKE (soft — any ADMIN/SUPER_ADMIN)
// Immediately stops the key from authenticating (see requireApiKey
// middleware, which checks isActive) but keeps the row so the audit
// trail — who created it, when, and when it was revoked — survives.
// ======================================================

const revokeApiKey = async (id: string, actorUserId: string) => {
  const existing = await prisma.apiKey.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "API key not found.");
  }

  if (!existing.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This API key is already revoked.");
  }

  const revoked = await prisma.apiKey.update({
    where: { id },
    data: { isActive: false },
    select: API_KEY_SELECT,
  });

  await activityLogService.logActivity({
    userId: actorUserId,
    action: "status_changed",
    entityType: "ApiKey",
    entityId: id,
    metadata: { name: existing.name, prefix: existing.prefix, to: "revoked" },
  });

  return revoked;
};

// ======================================================
// HARD DELETE (SUPER_ADMIN only — enforced again in the route layer)
// Only allowed on an already-revoked key. This forces a deliberate
// two-step action (revoke, then delete) rather than one destructive
// click, and guarantees a still-active key can never be silently wiped
// out. The activity log entry is written BEFORE the delete so the audit
// trail survives the row being gone.
// ======================================================

const hardDeleteApiKey = async (id: string, actorUserId: string) => {
  const existing = await prisma.apiKey.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "API key not found.");
  }

  if (existing.isActive) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "This key is still active. Revoke it first before permanently deleting it.",
    );
  }

  await activityLogService.logActivity({
    userId: actorUserId,
    action: "deleted",
    entityType: "ApiKey",
    entityId: id,
    metadata: { name: existing.name, prefix: existing.prefix },
  });

  await prisma.apiKey.delete({ where: { id } });
};

export const apiKeyService = {
  createApiKey,
  getAllApiKeys,
  revokeApiKey,
  hardDeleteApiKey,
};