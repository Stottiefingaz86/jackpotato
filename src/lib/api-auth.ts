import { store } from "@/lib/data/store";
import type { ApiKey } from "@/lib/types";

export interface AuthedKey {
  ok: true;
  apiKey: ApiKey;
}

export interface AuthError {
  ok: false;
  status: number;
  error: string;
}

export function authenticateApiKey(
  req: Request,
  required?: "public" | "secret"
): AuthedKey | AuthError {
  const header =
    req.headers.get("x-api-key") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!header) {
    return { ok: false, status: 401, error: "missing_api_key" };
  }

  // Showcase auth: accept a match against the plaintext (stored as
  // `hash:<plaintext>`), the raw hashedKey, or the preview, and also
  // accept the magic string "demo" to bind to the first tenant's keys.
  const isDemo = header.toLowerCase() === "demo";
  const key = store.apiKeys.find((k) => {
    if (isDemo) {
      if (required && k.type !== required) return false;
      return !k.revokedAt;
    }
    const plaintext = k.hashedKey.startsWith("hash:")
      ? k.hashedKey.slice(5)
      : k.hashedKey;
    return (
      plaintext === header ||
      k.hashedKey === header ||
      k.preview === header
    );
  });

  if (!key) return { ok: false, status: 401, error: "invalid_api_key" };
  return markUsed(key, required);
}

function markUsed(key: ApiKey, required?: "public" | "secret"): AuthedKey | AuthError {
  if (key.revokedAt) {
    return { ok: false, status: 403, error: "revoked_api_key" };
  }
  if (required && key.type !== required) {
    return { ok: false, status: 403, error: "wrong_key_type" };
  }
  key.lastUsedAt = new Date().toISOString();
  return { ok: true, apiKey: key };
}

/** Shared idempotency cache (process-lifetime). */
const g = globalThis as unknown as { __jpIdem?: Map<string, string> };
if (!g.__jpIdem) g.__jpIdem = new Map();
export const idempotencyCache: Map<string, string> = g.__jpIdem;

export function takeIdempotent<T>(
  key: string | null | undefined,
  produce: () => T
): { body: T; replayed: boolean } {
  if (!key) return { body: produce(), replayed: false };
  const prior = idempotencyCache.get(key);
  if (prior) return { body: JSON.parse(prior), replayed: true };
  const body = produce();
  idempotencyCache.set(key, JSON.stringify(body));
  if (idempotencyCache.size > 1000) {
    const first = idempotencyCache.keys().next().value;
    if (first) idempotencyCache.delete(first);
  }
  return { body, replayed: false };
}
