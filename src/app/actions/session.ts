"use server";

import { revalidatePath } from "next/cache";
import { setCurrentTenantId } from "@/lib/session";

export async function switchTenant(tenantId: string) {
  await setCurrentTenantId(tenantId);
  revalidatePath("/admin", "layout");
}
