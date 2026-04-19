"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentTenantId } from "@/lib/session";
import { getCrate, nextId, store } from "@/lib/data/store";
import type {
  Crate,
  CrateArtVariant,
  CratePrize,
  CratePrizeType,
  CrateRarity,
  CrateStatus,
  CrateUnlockTrigger,
} from "@/lib/types";

export interface CratePrizeInput {
  id?: string;
  type: CratePrizeType;
  label: string;
  value: number;
  weight: number;
  subtitle?: string;
}

export interface CrateFormInput {
  id?: string;
  name: string;
  description: string;
  rarity: CrateRarity;
  status: CrateStatus;
  currency: string;
  brandIds: string[];
  color?: string;
  unlockTrigger: CrateUnlockTrigger;
  maxOpensPerDay: number | null;
  artVariant: CrateArtVariant;
  /** Required when `artVariant === "custom"`. Can be a data URL. */
  artImageUrl?: string;
  prizes: CratePrizeInput[];
}

export async function saveCrate(input: CrateFormInput) {
  const tenantId = await getCurrentTenantId();
  const now = new Date().toISOString();

  const prizes: CratePrize[] = input.prizes.map((p) => ({
    id: p.id ?? nextId("prz"),
    type: p.type,
    label: p.label,
    value: p.value,
    weight: p.weight,
    subtitle: p.subtitle,
    currency: input.currency,
  }));

  let crate: Crate;
  if (input.id) {
    const existing = getCrate(input.id);
    if (!existing) throw new Error("Crate not found");
    crate = {
      ...existing,
      name: input.name,
      description: input.description,
      rarity: input.rarity,
      status: input.status,
      currency: input.currency,
      brandIds: input.brandIds,
      color: input.color,
      unlockTrigger: input.unlockTrigger,
      maxOpensPerDay: input.maxOpensPerDay,
      artVariant: input.artVariant,
      artImageUrl: input.artImageUrl,
      prizes,
      updatedAt: now,
    };
    const idx = store.crates.findIndex((c) => c.id === crate.id);
    store.crates[idx] = crate;
  } else {
    crate = {
      id: nextId("crt"),
      tenantId,
      brandIds: input.brandIds,
      name: input.name,
      description: input.description,
      rarity: input.rarity,
      status: input.status,
      currency: input.currency,
      color: input.color,
      unlockTrigger: input.unlockTrigger,
      maxOpensPerDay: input.maxOpensPerDay,
      artVariant: input.artVariant,
      artImageUrl: input.artImageUrl,
      prizes,
      createdAt: now,
      updatedAt: now,
    };
    store.crates.push(crate);
  }

  revalidatePath("/admin/crates");
  redirect("/admin/crates");
}

export async function deleteCrate(id: string) {
  store.crates = store.crates.filter((c) => c.id !== id);
  store.crateUnlocks = store.crateUnlocks.filter((u) => u.crateId !== id);
  revalidatePath("/admin/crates");
  redirect("/admin/crates");
}
