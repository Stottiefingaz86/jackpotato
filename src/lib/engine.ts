import { bus } from "@/lib/bus";
import {
  store,
  getTiersForCampaign,
  nextId,
  getCampaign,
} from "@/lib/data/store";
import type {
  BetEvent,
  ContributionEvent,
  JackpotCampaign,
  JackpotTier,
  JackpotWin,
  TriggerType,
} from "@/lib/types";

export interface IngestInput {
  tenantId: string;
  brandId: string;
  playerId: string;
  gameId: string;
  gameGroup: string;
  stakeAmount: number;
  currency: string;
  externalRef?: string;
  timestamp?: string;
}

export interface IngestResult {
  success: boolean;
  duplicate?: boolean;
  matchedCampaigns: number;
  contributions: Array<{
    campaignId: string;
    tierId: string;
    amount: number;
  }>;
  wins: Array<{ campaignId: string; tierId: string; winAmount: number }>;
}

const DISPLAY_NAMES = [
  { name: "Lena K.", country: "DE" },
  { name: "Marco V.", country: "IT" },
  { name: "Aisha N.", country: "UK" },
  { name: "Ben W.", country: "US" },
  { name: "Sofia R.", country: "ES" },
  { name: "Yuki T.", country: "JP" },
  { name: "Hanna L.", country: "FI" },
  { name: "Omar F.", country: "SE" },
  { name: "Priya S.", country: "IN" },
  { name: "Lucas P.", country: "BR" },
];

function pickDisplayName(playerId: string) {
  let h = 0;
  for (let i = 0; i < playerId.length; i++) h = (h * 31 + playerId.charCodeAt(i)) | 0;
  return DISPLAY_NAMES[Math.abs(h) % DISPLAY_NAMES.length];
}

export function eligibleCampaigns(input: {
  tenantId: string;
  brandId: string;
  gameId: string;
  gameGroup: string;
  currency: string;
}): JackpotCampaign[] {
  return store.campaigns.filter((c) => {
    if (c.status !== "active") return false;
    if (c.tenantId !== input.tenantId) return false;
    if (!c.brandIds.includes(input.brandId)) return false;
    if (c.currency !== input.currency) return false;
    const games = store.eligibleGames.filter((g) => g.campaignId === c.id);
    if (games.length === 0) return true;
    return games.some(
      (g) => g.gameId === input.gameId || g.gameGroup === input.gameGroup
    );
  });
}

/** Find a matching campaign ignoring brand/currency guards (sandbox fallback). */
export function loosestEligible(tenantId: string): JackpotCampaign[] {
  return store.campaigns.filter(
    (c) => c.status === "active" && c.tenantId === tenantId
  );
}

export function splitContribution(
  totalContribution: number,
  tiers: JackpotTier[]
) {
  return tiers.map((tier) => ({
    tierId: tier.id,
    amount: +(totalContribution * (tier.splitPercent / 100)).toFixed(4),
  }));
}

export function ingestBetEvent(input: IngestInput): IngestResult {
  const now = input.timestamp ?? new Date().toISOString();

  // Idempotency on externalRef
  if (input.externalRef) {
    const dup = store.betEvents.find((e) => e.externalRef === input.externalRef);
    if (dup) {
      return {
        success: true,
        duplicate: true,
        matchedCampaigns: 0,
        contributions: [],
        wins: [],
      };
    }
  }

  const campaigns = eligibleCampaigns(input);

  const betEvent: BetEvent = {
    id: nextId("bet"),
    tenantId: input.tenantId,
    brandId: input.brandId,
    playerId: input.playerId,
    gameId: input.gameId,
    gameGroup: input.gameGroup,
    stakeAmount: input.stakeAmount,
    currency: input.currency,
    externalRef: input.externalRef,
    createdAt: now,
  };
  store.betEvents.unshift(betEvent);
  if (store.betEvents.length > 500) store.betEvents.length = 500;

  bus.publish({
    type: "bet.ingested",
    tenantId: input.tenantId,
    brandId: input.brandId,
    gameId: input.gameId,
    stakeAmount: input.stakeAmount,
    currency: input.currency,
    timestamp: now,
  });

  const contributions: IngestResult["contributions"] = [];
  const wins: IngestResult["wins"] = [];

  for (const campaign of campaigns) {
    const totalContribution = +(
      input.stakeAmount * campaign.contributionRate
    ).toFixed(4);
    if (totalContribution <= 0) continue;
    const tiers = getTiersForCampaign(campaign.id);
    if (tiers.length === 0) continue;
    const splits = splitContribution(totalContribution, tiers);

    for (const s of splits) {
      const tier = store.tiers.find((t) => t.id === s.tierId)!;
      tier.currentAmount = +(tier.currentAmount + s.amount).toFixed(2);
      tier.updatedAt = now;

      const contribution: ContributionEvent = {
        id: nextId("ctr"),
        betEventId: betEvent.id,
        campaignId: campaign.id,
        tierId: tier.id,
        amount: s.amount,
        createdAt: now,
      };
      store.contributions.unshift(contribution);
      if (store.contributions.length > 1000)
        store.contributions.length = 1000;

      contributions.push({
        campaignId: campaign.id,
        tierId: tier.id,
        amount: s.amount,
      });

      bus.publish({
        type: "jackpot.updated",
        campaignId: campaign.id,
        tierId: tier.id,
        currentAmount: tier.currentAmount,
        contributionAmount: s.amount,
        timestamp: now,
      });

      // Must-drop trigger: if this contribution crossed the threshold.
      if (
        tier.mustDropAmount !== undefined &&
        tier.currentAmount >= tier.mustDropAmount
      ) {
        const win = triggerWin(
          campaign.id,
          tier.id,
          "must_drop",
          input.playerId,
          input.brandId,
          input.gameId
        );
        if (win)
          wins.push({
            campaignId: campaign.id,
            tierId: tier.id,
            winAmount: win.winAmount,
          });
        continue;
      }

      // Progressive random trigger on Mega-like tiers.
      const chance = campaign.rules.megaHitChancePerContribution ?? 0;
      if (
        chance > 0 &&
        tier.sortOrder === 0 &&
        Math.random() < chance
      ) {
        const win = triggerWin(
          campaign.id,
          tier.id,
          "progressive",
          input.playerId,
          input.brandId,
          input.gameId
        );
        if (win)
          wins.push({
            campaignId: campaign.id,
            tierId: tier.id,
            winAmount: win.winAmount,
          });
      }
    }
  }

  return {
    success: true,
    matchedCampaigns: campaigns.length,
    contributions,
    wins,
  };
}

export function triggerWin(
  campaignId: string,
  tierId: string,
  triggerType: TriggerType,
  playerId?: string,
  brandId?: string,
  gameId?: string
): JackpotWin | null {
  const campaign = getCampaign(campaignId);
  const tier = store.tiers.find((t) => t.id === tierId);
  if (!campaign || !tier) return null;

  const winAmount = +tier.currentAmount.toFixed(2);
  const now = new Date().toISOString();
  const resolvedBrand =
    brandId ?? campaign.brandIds[0] ?? store.brands[0]?.id ?? "brd_unknown";
  const resolvedPlayer = playerId ?? `player_${Math.floor(Math.random() * 90000 + 10000)}`;
  const display = pickDisplayName(resolvedPlayer);

  const win: JackpotWin = {
    id: nextId("win"),
    campaignId,
    tierId,
    tenantId: campaign.tenantId,
    brandId: resolvedBrand,
    playerId: resolvedPlayer,
    displayName: display.name,
    country: display.country,
    gameId,
    triggerType,
    winAmount,
    wonAt: now,
  };
  store.winners.unshift(win);
  if (store.winners.length > 200) store.winners.length = 200;

  // Reset the tier to its reset amount.
  tier.currentAmount = tier.resetAmount;
  tier.updatedAt = now;
  if (tier.mustDropAmount !== undefined) {
    // Re-schedule must-drop window for the meter widget.
    tier.mustDropAt = new Date(
      Date.now() +
        (campaign.rules.maxDropIntervalSeconds ?? 3600) * 1000
    ).toISOString();
  }

  bus.publish({
    type: "jackpot.won",
    campaignId,
    tierId,
    winAmount,
    playerDisplay: display.name,
    country: display.country,
    gameId,
    triggerType,
    timestamp: now,
  });
  bus.publish({
    type: "jackpot.updated",
    campaignId,
    tierId,
    currentAmount: tier.currentAmount,
    contributionAmount: 0,
    timestamp: now,
  });

  return win;
}
