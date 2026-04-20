"use client";

import { RewardShell } from "./reward-shell";
import type { ThemePattern } from "@/lib/types";
import { cn } from "@/lib/utils";

const BRAND = "var(--jp-primary, oklch(0.72 0.22 300))";

export interface LevelProgressProps {
  className?: string;
  accent?: string;
  username?: string;
  level?: number;
  xp?: number;
  xpForNext?: number;
  balance?: number;
  bonus?: number;
  currency?: string;
  compact?: boolean;
  pattern?: ThemePattern;
}

export function LevelProgress({
  className,
  accent = BRAND,
  username = "rubberjam",
  level = 7,
  xp = 1850,
  xpForNext = 2200,
  balance,
  bonus = 0,
  currency = "USD",
  compact = false,
  pattern,
}: LevelProgressProps) {
  const pct = Math.max(0, Math.min(100, (xp / xpForNext) * 100));
  const remaining = Math.max(0, xpForNext - xp);

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);

  return (
    <RewardShell className={cn(className)} pattern={pattern}>
      {!compact && balance != null ? (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[color:var(--rw-border-soft)]">
          <div>
            <div className="text-xs text-muted-foreground">Balance</div>
            <div className="font-display text-xl font-semibold tabular-nums">
              {fmtMoney(balance)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Bonus</div>
            <div className="font-display text-xl font-semibold tabular-nums text-muted-foreground">
              {fmtMoney(bonus)}
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="font-medium">Level {level}</span>
          {username ? (
            <span className="text-xs text-muted-foreground truncate">
              · {username}
            </span>
          ) : null}
        </div>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {remaining.toLocaleString()} XP to next
        </span>
      </div>

      <div className="h-2 rounded-full bg-[color:var(--rw-track)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: accent }}
        />
      </div>

      <div className="mt-2 text-[11px] text-muted-foreground tabular-nums">
        {xp.toLocaleString()} / {xpForNext.toLocaleString()} XP
      </div>
    </RewardShell>
  );
}
