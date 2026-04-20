"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Lock, Flame } from "lucide-react";
import { RewardShell } from "./reward-shell";
import type { ThemePattern } from "@/lib/types";
import { cn } from "@/lib/utils";

const BRAND = "var(--jp-primary, oklch(0.72 0.22 300))";

export interface DailyBonusDay {
  day: number;
  amount: number;
  type?: "cash" | "bonus" | "freespins" | "freebet";
  locked?: boolean;
}

export interface DailyBonusClaimProps {
  className?: string;
  accent?: string;
  title?: string;
  /** 0 = nothing claimed, 3 = first 3 days claimed, day 4 is the current claim */
  streak?: number;
  /** Seconds until next claim is available */
  nextInSeconds?: number;
  days?: DailyBonusDay[];
  currency?: string;
  pattern?: ThemePattern;
}

const DEFAULT_DAYS: DailyBonusDay[] = [
  { day: 1, amount: 1, type: "cash" },
  { day: 2, amount: 2, type: "cash" },
  { day: 3, amount: 5, type: "cash" },
  { day: 4, amount: 10, type: "bonus" },
  { day: 5, amount: 15, type: "freespins" },
  { day: 6, amount: 25, type: "freebet" },
  { day: 7, amount: 50, type: "cash" },
];

const TYPE_LABEL: Record<NonNullable<DailyBonusDay["type"]>, string> = {
  cash: "Cash",
  bonus: "Bonus",
  freespins: "FS",
  freebet: "FB",
};

function fmtHMS(s: number) {
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export function DailyBonusClaim({
  className,
  accent = BRAND,
  title = "Login rewards",
  streak = 3,
  nextInSeconds = 56_213,
  days = DEFAULT_DAYS,
  currency = "USD",
  pattern,
}: DailyBonusClaimProps) {
  const [secs, setSecs] = useState(nextInSeconds);
  useEffect(() => setSecs(nextInSeconds), [nextInSeconds]);
  useEffect(() => {
    const i = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, []);

  const todayIndex = Math.min(streak, days.length - 1);
  const today = days[todayIndex];
  const claimReady = secs === 0;

  const fmt = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }),
    [currency]
  );

  return (
    <RewardShell className={cn(className)} pattern={pattern}>
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{title}</div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Flame className="size-3" />
            {streak} day streak
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground tabular-nums">
          {claimReady ? "Ready" : `Next in ${fmtHMS(secs)}`}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          const state =
            i < streak
              ? "claimed"
              : i === streak
                ? "today"
                : "locked";
          return (
            <div
              key={d.day}
              className={cn(
                "relative overflow-hidden rounded-lg border text-center py-2",
                state === "claimed" &&
                  "border-[color:var(--rw-border-soft)] bg-[color:var(--rw-surface-muted)]",
                state === "today" && "ring-1",
                state === "locked" &&
                  "border-[color:var(--rw-border-soft)] bg-[color:var(--rw-surface-deep)]"
              )}
              style={
                state === "today"
                  ? {
                      borderColor: accent,
                      boxShadow: `0 0 0 1px ${accent} inset`,
                    }
                  : undefined
              }
            >
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
                Day {d.day}
              </div>
              <div
                className={cn(
                  "font-semibold tabular-nums text-xs mt-0.5",
                  state === "locked" && "text-muted-foreground"
                )}
                style={state === "today" ? { color: accent } : undefined}
              >
                {d.type === "freespins"
                  ? `${d.amount}×`
                  : fmt.format(d.amount).replace(/\.00$/, "")}
              </div>
              <div className="text-[9px] text-muted-foreground">
                {TYPE_LABEL[d.type ?? "cash"]}
              </div>

              {state === "claimed" ? (
                <span
                  className="absolute top-1 right-1 grid size-3.5 place-items-center rounded-full text-background"
                  style={{ background: accent }}
                >
                  <Check className="size-2.5" />
                </span>
              ) : null}
              {state === "locked" ? (
                <Lock className="absolute top-1 right-1 size-3 text-muted-foreground" />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          Today:{" "}
          <span className="font-semibold text-foreground">
            {today.type === "freespins"
              ? `${today.amount} free spins`
              : `${fmt.format(today.amount)} ${TYPE_LABEL[today.type ?? "cash"]}`}
          </span>
        </div>
        <button
          disabled={!claimReady}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition",
            claimReady
              ? "text-background"
              : "bg-[color:var(--rw-surface)] text-muted-foreground cursor-not-allowed"
          )}
          style={claimReady ? { background: accent } : undefined}
        >
          {claimReady ? "Claim" : "Locked"}
        </button>
      </div>
    </RewardShell>
  );
}
