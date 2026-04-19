"use client";

import { useEffect, useMemo, useState } from "react";
import { useJackpotStream } from "@/hooks/use-jackpot-stream";
import type {
  JackpotCampaign,
  JackpotTier,
  PublicJackpotTier,
  RealtimeEvent,
} from "@/lib/types";

export interface LiveCampaign {
  campaign: Pick<
    JackpotCampaign,
    "id" | "name" | "currency" | "type" | "description"
  > & {
    locale?: string;
  };
  tiers: Array<
    Pick<
      JackpotTier | PublicJackpotTier,
      "name" | "displayLabel" | "splitPercent" | "color"
    > & {
      tierId: string;
      currentAmount: number;
      mustDropAmount?: number;
      mustDropAt?: string | null;
    }
  >;
}

/**
 * Takes an initial LiveCampaign (as delivered by the server) and returns
 * live amounts + most recent win for that campaign.
 */
export function useLiveCampaign(initial: LiveCampaign) {
  const stream = useJackpotStream();
  const campaignId = initial.campaign.id;

  const tierIds = useMemo(
    () => new Set(initial.tiers.map((t) => t.tierId)),
    [initial.tiers]
  );

  const tiers = initial.tiers.map((t) => ({
    ...t,
    currentAmount: stream.tiers[t.tierId] ?? t.currentAmount,
  }));

  const total = tiers.reduce((sum, t) => sum + t.currentAmount, 0);

  const lastWin = useMemo(() => {
    return stream.recentWins.find(
      (w) => w.campaignId === campaignId && tierIds.has(w.tierId)
    );
  }, [stream.recentWins, campaignId, tierIds]);

  // Track the most recent contribution for this campaign, used to trigger
  // a subtle pulse on the amount when it updates.
  const [pulseKey, setPulseKey] = useState(0);
  useEffect(() => {
    const last = stream.recentEvents[0];
    if (!last) return;
    if (
      last.type === "jackpot.updated" &&
      last.campaignId === campaignId &&
      tierIds.has(last.tierId)
    ) {
      setPulseKey((k) => k + 1);
    }
  }, [stream.recentEvents, campaignId, tierIds]);

  return {
    tiers,
    total,
    lastWin,
    pulseKey,
    connected: stream.connected,
  };
}

export function pickAccentColor(e: RealtimeEvent | undefined) {
  if (!e) return undefined;
  if (e.type === "jackpot.won") return "var(--jp-accent)";
  return undefined;
}
