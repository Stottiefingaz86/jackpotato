import { cookies } from "next/headers";
import { store } from "@/lib/data/store";

/**
 * Minimal session/tenant context for the showcase. A real app would derive
 * this from auth; here we let the user switch tenants via a cookie.
 */

const TENANT_COOKIE = "jp_tenant";

export async function getCurrentTenantId(): Promise<string> {
  const c = await cookies();
  const v = c.get(TENANT_COOKIE)?.value;
  if (v && store.tenants.find((t) => t.id === v)) return v;
  return store.tenants[0]?.id ?? "tnt_jackpotato";
}

export async function getCurrentTenant() {
  const id = await getCurrentTenantId();
  return store.tenants.find((t) => t.id === id)!;
}

export async function setCurrentTenantId(tenantId: string) {
  const c = await cookies();
  c.set(TENANT_COOKIE, tenantId, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
}
