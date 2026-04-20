"use client";

import { Lock, Check } from "lucide-react";
import { RewardShell } from "./reward-shell";
import type { ThemePattern } from "@/lib/types";
import { cn } from "@/lib/utils";

const BRAND = "var(--jp-primary, oklch(0.72 0.22 300))";

export interface RankLadderRank {
  id: string;
  label: string;
  /** Wager required to reach this rank */
  threshold: number;
}

export interface RankLadderProps {
  className?: string;
  title?: string;
  accent?: string;
  currency?: string;
  wagered?: number;
  currentRankId?: string;
  ranks?: RankLadderRank[];
  pattern?: ThemePattern;
}

const DEFAULT_RANKS: RankLadderRank[] = [
  { id: "bronze-i", label: "Bronze I", threshold: 4_000 },
  { id: "bronze-ii", label: "Bronze II", threshold: 12_000 },
  { id: "bronze-iii", label: "Bronze III", threshold: 30_000 },
  { id: "bronze-iv", label: "Bronze IV", threshold: 60_000 },
  { id: "silver-i", label: "Silver I", threshold: 120_000 },
];

function formatMoney(n: number, c = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: c,
    maximumFractionDigits: 0,
  }).format(n);
}

export function RankLadder({
  className,
  title = "Rank progress",
  accent = BRAND,
  currency = "USD",
  wagered = 0,
  currentRankId,
  ranks = DEFAULT_RANKS,
  pattern,
}: RankLadderProps) {
  const activeIdx = (() => {
    if (currentRankId) {
      const idx = ranks.findIndex((r) => r.id === currentRankId);
      if (idx >= 0) return idx;
    }
    const idx = ranks.findIndex((r) => wagered < r.threshold);
    return idx === -1 ? ranks.length - 1 : idx;
  })();

  const currentRank = ranks[activeIdx];
  const nextRank = ranks[Math.min(activeIdx + 1, ranks.length - 1)];
  const prevThreshold = activeIdx > 0 ? ranks[activeIdx - 1].threshold : 0;
  const pct = Math.max(
    0,
    Math.min(
      100,
      ((wagered - prevThreshold) /
        Math.max(1, nextRank.threshold - prevThreshold)) *
        100
    )
  );
  const completedPct = Math.round(pct);

  return (
    <RewardShell className={cn(className)} pattern={pattern}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{title}</div>
          <div className="text-[11px] text-muted-foreground">
            {currentRank.label} — {wagered === 0 ? "Unranked" : "Active"}
          </div>
        </div>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {completedPct}% to {nextRank.label}
        </span>
      </div>

      <div className="h-2 rounded-full bg-[color:var(--rw-track)] overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: accent }}
        />
      </div>
      <div className="text-[11px] text-muted-foreground mb-3 tabular-nums">
        {formatMoney(wagered, currency)} / {formatMoney(nextRank.threshold, currency)}{" "}
        wagered
      </div>

      {/* Rank chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {ranks.map((r, i) => {
          const state =
            i < activeIdx ? "unlocked" : i === activeIdx ? "current" : "locked";
          return (
            <div key={r.id} className="flex items-center gap-1.5 shrink-0">
              <div
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg border px-2 py-1.5",
                  state === "current" && "border-transparent",
                  state === "unlocked" &&
                    "border-[color:var(--rw-border-soft)] bg-[color:var(--rw-surface-muted)]",
                  state === "locked" &&
                    "border-[color:var(--rw-border-soft)] bg-[color:var(--rw-surface-deep)]"
                )}
                style={
                  state === "current"
                    ? { borderColor: accent, background: `${accent}14` }
                    : undefined
                }
              >
                {state === "unlocked" ? (
                  <Check className="size-3 text-muted-foreground" />
                ) : state === "locked" ? (
                  <Lock className="size-3 text-muted-foreground" />
                ) : (
                  <span
                    className="inline-block size-1.5 rounded-full"
                    style={{ background: accent }}
                  />
                )}
                <span
                  className={cn(
                    "text-[11px] font-medium whitespace-nowrap",
                    state === "locked" && "text-muted-foreground"
                  )}
                  style={state === "current" ? { color: accent } : undefined}
                >
                  {r.label}
                </span>
              </div>
              {i < ranks.length - 1 ? (
                <span className="text-muted-foreground/50 text-xs">›</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </RewardShell>
  );
}
