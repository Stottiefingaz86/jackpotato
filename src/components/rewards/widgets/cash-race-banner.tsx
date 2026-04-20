"use client";

import { useEffect, useMemo, useState } from "react";
import { RewardShell } from "./reward-shell";
import type { ThemePattern } from "@/lib/types";
import { cn } from "@/lib/utils";

export type CashRaceTab = "daily" | "weekly" | "monthly";

export interface CashRacePlayer {
  rank: 1 | 2 | 3;
  name: string;
  points: number;
  reward: number;
}

export interface CashRaceBannerProps {
  className?: string;
  /** Hex accent — defaults to brand primary. */
  accent?: string;
  title?: string;
  prizePool?: number;
  currency?: string;
  defaultTab?: CashRaceTab;
  /** Seconds until the race ends (per tab). */
  endsInByTab?: Record<CashRaceTab, number>;
  podiumByTab?: Record<CashRaceTab, CashRacePlayer[]>;
  pattern?: ThemePattern;
}

const BRAND = "var(--jp-primary, oklch(0.72 0.22 300))";

const DEFAULT_PODIUM: Record<CashRaceTab, CashRacePlayer[]> = {
  daily: [
    { rank: 1, name: "nova.94", points: 1_009_087, reward: 4000 },
    { rank: 2, name: "rubberjam", points: 938_929, reward: 1800 },
    { rank: 3, name: "noelemahk", points: 921_905, reward: 1000 },
  ],
  weekly: [
    { rank: 1, name: "vikingsaw", points: 12_402_118, reward: 20_000 },
    { rank: 2, name: "kira_drops", points: 10_891_210, reward: 10_000 },
    { rank: 3, name: "mochaflex", points: 9_550_740, reward: 5_000 },
  ],
  monthly: [
    { rank: 1, name: "bluechip", points: 48_220_901, reward: 80_000 },
    { rank: 2, name: "halfshade", points: 41_009_212, reward: 40_000 },
    { rank: 3, name: "pixelking", points: 38_881_009, reward: 20_000 },
  ],
};

const DEFAULT_ENDS_IN: Record<CashRaceTab, number> = {
  daily: 12 * 3600 + 38 * 60 + 21,
  weekly: 4 * 86400 + 3 * 3600 + 12 * 60,
  monthly: 10 * 86400 + 8 * 3600 + 4 * 60,
};

const DEFAULT_POOL: Record<CashRaceTab, number> = {
  daily: 10_000,
  weekly: 100_000,
  monthly: 500_000,
};

function formatCountdown(s: number) {
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  return { days, hours, minutes, seconds };
}

function formatCurrency(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPoints(n: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

export function CashRaceBanner({
  className,
  accent = BRAND,
  title = "Daily Race",
  prizePool,
  currency = "USD",
  defaultTab = "daily",
  endsInByTab = DEFAULT_ENDS_IN,
  podiumByTab = DEFAULT_PODIUM,
  pattern,
}: CashRaceBannerProps) {
  const [tab, setTab] = useState<CashRaceTab>(defaultTab);
  const [secondsLeft, setSecondsLeft] = useState(endsInByTab[defaultTab]);

  useEffect(() => {
    setSecondsLeft(endsInByTab[tab]);
  }, [tab, endsInByTab]);

  useEffect(() => {
    const i = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(i);
  }, []);

  const pool = prizePool ?? DEFAULT_POOL[tab];
  const podium = podiumByTab[tab];
  const { days, hours, minutes, seconds } = useMemo(
    () => formatCountdown(secondsLeft),
    [secondsLeft]
  );

  const labelByTab: Record<CashRaceTab, string> = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
  };

  return (
    <RewardShell
      className={cn("p-5 sm:p-6", className)}
      pad={false}
      pattern={pattern}
    >
      <div className="relative grid gap-6 lg:grid-cols-[1.1fr_1fr] items-center">
        {/* LEFT: Pool + tabs */}
        <div className="flex flex-col gap-4">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Cash Race
          </span>

          <div className="flex items-baseline gap-3 flex-wrap">
            <span
              className="font-display text-4xl sm:text-5xl font-bold leading-none tabular-nums"
              style={{ color: accent }}
            >
              {formatCurrency(pool, currency)}
            </span>
            <span className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
              {labelByTab[tab]} Race
            </span>
          </div>

          <div className="inline-flex rounded-full border border-[color:var(--rw-border-soft)] bg-[color:var(--rw-surface-deep)] p-1 w-fit">
            {(["daily", "weekly", "monthly"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition capitalize",
                  tab === t
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Countdown */}
        <div className="flex flex-col gap-3 lg:items-end">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Race ends in
          </span>
          <div className="grid grid-cols-4 gap-2 w-full lg:max-w-sm">
            {[
              { v: days, l: "Days" },
              { v: hours, l: "Hours" },
              { v: minutes, l: "Min" },
              { v: seconds, l: "Sec" },
            ].map(({ v, l }) => (
              <div
                key={l}
                className="rounded-xl border border-[color:var(--rw-border-soft)] bg-[color:var(--rw-surface-deep)] px-2 py-2 text-center"
              >
                <div className="font-display text-2xl font-bold tabular-nums text-foreground">
                  {String(v).padStart(2, "0")}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Podium */}
      <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
        {podium.map((p) => (
          <div
            key={p.rank}
            className={cn(
              "relative overflow-hidden rounded-xl border bg-[color:var(--rw-surface)] p-3",
              p.rank === 1
                ? "border-[color:var(--rw-border)]"
                : "border-[color:var(--rw-border-soft)]"
            )}
            style={
              p.rank === 1
                ? { borderColor: `${accent}80` }
                : undefined
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-md text-[11px] font-bold",
                    p.rank === 1
                      ? "text-background"
                      : "bg-[color:var(--rw-surface-deep)] text-muted-foreground"
                  )}
                  style={
                    p.rank === 1 ? { background: accent } : undefined
                  }
                >
                  {p.rank}
                </span>
                <span className="font-medium truncate">{p.name}</span>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Points</div>
                <div className="font-semibold tabular-nums">
                  {formatPoints(p.points)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground">Reward</div>
                <div
                  className={cn(
                    "font-semibold tabular-nums",
                    p.rank !== 1 && "text-foreground"
                  )}
                  style={
                    p.rank === 1 ? { color: accent } : undefined
                  }
                >
                  {formatCurrency(p.reward, currency)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </RewardShell>
  );
}
