"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useJackpotConnected,
  useJackpotLatestWin,
  useJackpotTiers,
} from "@/hooks/use-jackpot-stream";
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
 *
 * Uses slice subscriptions so this component only re-renders when one of
 * *its* tiers updates — not on every SSE event in the tab.
 */
export function useLiveCampaign(initial: LiveCampaign) {
  const campaignId = initial.campaign.id;

  const tierIds = useMemo(
    () => initial.tiers.map((t) => t.tierId),
    [initial.tiers]
  );

  const tierAmounts = useJackpotTiers(tierIds);
  const lastWin = useJackpotLatestWin(campaignId, tierIds);
  const connected = useJackpotConnected();

  const tiers = useMemo(
    () =>
      initial.tiers.map((t) => ({
        ...t,
        currentAmount: tierAmounts[t.tierId] ?? t.currentAmount,
      })),
    [initial.tiers, tierAmounts]
  );

  const total = useMemo(
    () => tiers.reduce((sum, t) => sum + t.currentAmount, 0),
    [tiers]
  );

  // Ticks whenever our tier amounts change — used as a cheap animation key
  // for subtle scale pulses on value updates. Stays stable when unrelated
  // campaigns update because `tierAmounts` is a stable-reference slice.
  const [pulseKey, setPulseKey] = useState(0);
  const prevAmountsRef = useRef(tierAmounts);
  useEffect(() => {
    if (prevAmountsRef.current !== tierAmounts) {
      prevAmountsRef.current = tierAmounts;
      setPulseKey((k) => k + 1);
    }
  }, [tierAmounts]);

  return {
    tiers,
    total,
    lastWin,
    pulseKey,
    connected,
  };
}

export function pickAccentColor(e: RealtimeEvent | undefined) {
  if (!e) return undefined;
  if (e.type === "jackpot.won") return "var(--jp-accent)";
  return undefined;
}
