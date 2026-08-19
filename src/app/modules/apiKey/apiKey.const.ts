import { Prisma } from "../../../../generated/prisma/client";

// keyHash intentionally excluded from every select — the hash is never
// returned to any client, even an admin. Only used internally for lookup.
export const API_KEY_SELECT = {
  id: true,
  name: true,
  prefix: true,
  lastUsedAt: true,
  expiresAt: true,
  isActive: true,
  createdById: true,
  createdAt: true,
} satisfies Prisma.ApiKeySelect;