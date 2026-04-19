"use server";

import { revalidatePath } from "next/cache";
import { getCurrentTenantId } from "@/lib/session";
import { nextId, store } from "@/lib/data/store";
import type { ApiKey, ApiKeyType } from "@/lib/types";

export async function createApiKey(input: {
  label: string;
  type: ApiKeyType;
  permissions: string[];
}): Promise<{ id: string; plaintext: string }> {
  const tenantId = await getCurrentTenantId();
  const prefix = input.type === "secret" ? "sk_live_" : "pk_live_";
  const body =
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10);
  const plaintext = `${prefix}${body}`;
  const preview = `${prefix}${"•".repeat(4)}${body.slice(-4)}`;
  const now = new Date().toISOString();
  const key: ApiKey = {
    id: nextId("key"),
    tenantId,
    label: input.label,
    type: input.type,
    preview,
    hashedKey: `hash:${plaintext}`,
    permissions: input.permissions,
    lastUsedAt: null,
    revokedAt: null,
    createdAt: now,
  };
  store.apiKeys.push(key);
  revalidatePath("/admin/keys");
  return { id: key.id, plaintext };
}

export async function revokeApiKey(id: string) {
  const k = store.apiKeys.find((x) => x.id === id);
  if (!k) return;
  k.revokedAt = new Date().toISOString();
  revalidatePath("/admin/keys");
}
