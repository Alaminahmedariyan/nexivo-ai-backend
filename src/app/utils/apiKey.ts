import crypto from "crypto";

const KEY_PREFIX = "nx_live_";

// Generates a new raw API key + its sha256 hash. Only the hash is ever
// persisted in the database — the raw key is returned to the caller
// exactly once at creation time and can never be retrieved again (same
// pattern as Stripe/GitHub personal access tokens).
export const generateApiKey = () => {
  const randomPart = crypto.randomBytes(24).toString("hex");
  const rawKey = `${KEY_PREFIX}${randomPart}`;
  const keyHash = hashApiKey(rawKey);
  const prefix = rawKey.slice(0, 12);

  return { rawKey, keyHash, prefix };
};

export const hashApiKey = (rawKey: string): string =>
  crypto.createHash("sha256").update(rawKey).digest("hex");