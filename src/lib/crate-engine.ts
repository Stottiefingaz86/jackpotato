import {
  getCrate,
  nextId,
  store,
} from "@/lib/data/store";
import type { Crate, CratePrize, CrateUnlock } from "@/lib/types";

/**
 * Pick a prize from a crate's pool using weighted random selection.
 * Exposed so the client can request a deterministic open outcome.
 */
export function pickPrize(crate: Crate): CratePrize {
  const total = crate.prizes.reduce((s, p) => s + p.weight, 0);
  if (total <= 0) return crate.prizes[0];
  let roll = Math.random() * total;
  for (const p of crate.prizes) {
    roll -= p.weight;
    if (roll <= 0) return p;
  }
  return crate.prizes[crate.prizes.length - 1];
}

export interface OpenCrateInput {
  crateId: string;
  playerId?: string;
  displayName?: string;
  country?: string;
}

export interface OpenCrateResult {
  success: boolean;
  error?: string;
  unlock?: CrateUnlock;
  prize?: CratePrize;
}

export function openCrate(input: OpenCrateInput): OpenCrateResult {
  const crate = getCrate(input.crateId);
  if (!crate) return { success: false, error: "crate_not_found" };
  if (crate.status !== "live" && crate.status !== "draft")
    return { success: false, error: "crate_not_open" };
  if (crate.prizes.length === 0)
    return { success: false, error: "empty_prize_pool" };

  const prize = pickPrize(crate);
  const now = new Date().toISOString();
  const unlock: CrateUnlock = {
    id: nextId("cru"),
    crateId: crate.id,
    tenantId: crate.tenantId,
    brandId: crate.brandIds[0] ?? "brd_unknown",
    playerId: input.playerId ?? "plr_demo",
    displayName: input.displayName ?? "Demo player",
    country: input.country,
    unlockedAt: now,
    openedAt: now,
    awardedPrizeId: prize.id,
  };
  store.crateUnlocks = [unlock, ...store.crateUnlocks].slice(0, 400);
  return { success: true, unlock, prize };
}
