"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentTenantId } from "@/lib/session";
import {
  getCampaign,
  getTiersForCampaign,
  nextId,
  store,
} from "@/lib/data/store";
import type {
  CampaignStatus,
  CampaignType,
  JackpotCampaign,
  JackpotTier,
} from "@/lib/types";

export interface TierInput {
  id?: string;
  name: string;
  displayLabel: string;
  splitPercent: number;
  seedAmount: number;
  resetAmount: number;
  mustDropAmount?: number;
  color?: string;
}

export interface CampaignFormInput {
  id?: string;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  currency: string;
  contributionRate: number;
  seedAmount: number;
  resetAmount: number;
  brandIds: string[];
  mustDropEnabled: boolean;
  maxDropIntervalSeconds?: number;
  tiers: TierInput[];
}

export async function saveCampaign(input: CampaignFormInput) {
  const tenantId = await getCurrentTenantId();
  const now = new Date().toISOString();

  let campaign: JackpotCampaign;
  if (input.id) {
    const existing = getCampaign(input.id);
    if (!existing) throw new Error("Campaign not found");
    campaign = {
      ...existing,
      name: input.name,
      description: input.description,
      type: input.type,
      status: input.status,
      currency: input.currency,
      contributionRate: input.contributionRate,
      seedAmount: input.seedAmount,
      resetAmount: input.resetAmount,
      brandIds: input.brandIds,
      rules: {
        ...existing.rules,
        mustDropEnabled: input.mustDropEnabled,
        maxDropIntervalSeconds: input.maxDropIntervalSeconds,
      },
      updatedAt: now,
    };
    const idx = store.campaigns.findIndex((c) => c.id === campaign.id);
    store.campaigns[idx] = campaign;

    const existingTiers = getTiersForCampaign(campaign.id);
    const keptIds = new Set<string>();

    input.tiers.forEach((t, i) => {
      const id = t.id ?? nextId("tier");
      keptIds.add(id);
      const existingTier = existingTiers.find((et) => et.id === id);
      const currentAmount = existingTier?.currentAmount ?? t.seedAmount;
      const tier: JackpotTier = {
        id,
        campaignId: campaign.id,
        sortOrder: i,
        name: t.name,
        displayLabel: t.displayLabel,
        splitPercent: t.splitPercent,
        seedAmount: t.seedAmount,
        resetAmount: t.resetAmount,
        mustDropAmount: t.mustDropAmount,
        currentAmount,
        color: t.color,
        createdAt: existingTier?.createdAt ?? now,
        updatedAt: now,
      };
      if (existingTier) {
        const idx = store.tiers.findIndex((x) => x.id === id);
        store.tiers[idx] = tier;
      } else {
        store.tiers.push(tier);
      }
    });
    store.tiers = store.tiers.filter(
      (t) => t.campaignId !== campaign.id || keptIds.has(t.id)
    );
  } else {
    const id = nextId("cmp");
    campaign = {
      id,
      tenantId,
      brandIds: input.brandIds,
      name: input.name,
      description: input.description,
      type: input.type,
      status: input.status,
      currency: input.currency,
      contributionRate: input.contributionRate,
      seedAmount: input.seedAmount,
      resetAmount: input.resetAmount,
      rules: {
        mustDropEnabled: input.mustDropEnabled,
        maxDropIntervalSeconds: input.maxDropIntervalSeconds,
      },
      startsAt: now,
      endsAt: null,
      createdAt: now,
      updatedAt: now,
    };
    store.campaigns.push(campaign);

    input.tiers.forEach((t, i) => {
      const tier: JackpotTier = {
        id: nextId("tier"),
        campaignId: campaign.id,
        sortOrder: i,
        name: t.name,
        displayLabel: t.displayLabel,
        splitPercent: t.splitPercent,
        seedAmount: t.seedAmount,
        resetAmount: t.resetAmount,
        mustDropAmount: t.mustDropAmount,
        currentAmount: t.seedAmount,
        color: t.color,
        createdAt: now,
        updatedAt: now,
      };
      store.tiers.push(tier);
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/campaigns");
  revalidatePath(`/admin/campaigns/${campaign.id}`);
  redirect(`/admin/campaigns/${campaign.id}`);
}

export async function toggleCampaignStatus(id: string) {
  const c = getCampaign(id);
  if (!c) return;
  c.status = c.status === "active" ? "paused" : "active";
  c.updatedAt = new Date().toISOString();
  revalidatePath("/admin/campaigns");
  revalidatePath(`/admin/campaigns/${id}`);
}

export async function deleteCampaign(id: string) {
  store.campaigns = store.campaigns.filter((c) => c.id !== id);
  store.tiers = store.tiers.filter((t) => t.campaignId !== id);
  revalidatePath("/admin/campaigns");
  redirect("/admin/campaigns");
}
