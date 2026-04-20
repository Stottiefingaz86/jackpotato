"use client";

import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import { RewardShell } from "./reward-shell";
import type { ThemePattern } from "@/lib/types";

const BRAND = "var(--jp-primary, oklch(0.72 0.22 300))";

export interface CashRaceLeaderboardRow {
  rank: number;
  name: string;
  wagered: number;
  reward: number;
  you?: boolean;
  hidden?: boolean;
}

export interface CashRaceLeaderboardProps {
  className?: string;
  accent?: string;
  title?: string;
  currency?: string;
  rows?: CashRaceLeaderboardRow[];
  yourWager?: number;
  yourRankThreshold?: number;
  /** When true, name column is masked with "Hidden" when row.hidden is true */
  respectHidden?: boolean;
  pattern?: ThemePattern;
}

const DEFAULT_ROWS: CashRaceLeaderboardRow[] = [
  { rank: 1, name: "Hidden", wagered: 1_799_979, reward: 4000, hidden: true },
  { rank: 2, name: "ADOL…", wagered: 1_350_693, reward: 2500 },
  { rank: 3, name: "loga…", wagered: 897_946, reward: 1500 },
  { rank: 4, name: "Hidden", wagered: 585_250, reward: 1000, hidden: true },
  { rank: 5, name: "eren…", wagered: 416_906, reward: 800 },
  { rank: 6, name: "SYou…", wagered: 393_186, reward: 700 },
  { rank: 7, name: "Vega…", wagered: 384_269, reward: 600 },
];

function formatMoney(n: number, c = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: c,
    maximumFractionDigits: 0,
  }).format(n);
}

/** Tier-tinted rank badge. Top 3 get gold / silver / bronze; others blend
 *  with the theme surface. Uses a rounded-lg "shield" rather than a hex so
 *  it reads cleanly at small sizes and doesn't need an asset. */
function RankBadge({ rank, accent }: { rank: number; accent: string }) {
  const isOne = rank === 1;
  const isTwo = rank === 2;
  const isThree = rank === 3;

  const { bg, ring, color } = (() => {
    if (isOne) {
      return {
        bg: `linear-gradient(160deg, oklch(from ${accent} calc(l + 0.1) c h / 100%), oklch(from ${accent} calc(l - 0.05) c h / 100%))`,
        ring: `oklch(from ${accent} calc(l + 0.12) c h / 65%)`,
        color: "oklch(0.16 0.02 275)",
      };
    }
    if (isTwo) {
      return {
        bg: "linear-gradient(160deg, oklch(0.86 0.012 260), oklch(0.68 0.015 260))",
        ring: "oklch(0.9 0.01 260 / 55%)",
        color: "oklch(0.18 0.02 275)",
      };
    }
    if (isThree) {
      return {
        bg: "linear-gradient(160deg, oklch(0.72 0.11 55), oklch(0.52 0.1 45))",
        ring: "oklch(0.78 0.1 55 / 55%)",
        color: "oklch(0.16 0.02 275)",
      };
    }
    return {
      bg: "var(--rw-surface)",
      ring: "var(--rw-border-soft)",
      color: "var(--jp-text, oklch(0.95 0.01 280))",
    };
  })();

  return (
    <span
      className="relative grid size-7 shrink-0 place-items-center rounded-[10px] font-semibold tabular-nums text-[11px]"
      style={{
        background: bg,
        boxShadow: `inset 0 0 0 1px ${ring}`,
        color,
      }}
    >
      {rank}
    </span>
  );
}

export function CashRaceLeaderboard({
  className,
  accent = BRAND,
  title = "Leaderboard",
  currency = "USD",
  rows = DEFAULT_ROWS,
  yourWager = 0,
  yourRankThreshold,
  pattern,
}: CashRaceLeaderboardProps) {
  const minWagerForBoard =
    yourRankThreshold ?? Math.max(0, (rows[rows.length - 1]?.wagered ?? 0) - yourWager + 1);

  return (
    <RewardShell className={cn("p-0", className)} pad={false} pattern={pattern}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{title}</div>
          <div className="text-[11px] text-muted-foreground">
            Live — top players
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5"
          style={{
            background: `oklch(from ${accent} l c h / 12%)`,
            color: accent,
          }}
        >
          <span
            className="inline-block size-1.5 rounded-full animate-pulse"
            style={{ background: accent }}
          />
          Live
        </span>
      </div>

      {/* Column headers — tight typography, no divider lines */}
      <div className="grid grid-cols-[40px_1fr_auto_auto] gap-x-4 px-5 pb-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <span>#</span>
        <span>Player</span>
        <span className="text-right">Wagered</span>
        <span className="text-right">Reward</span>
      </div>

      {/* Rows — no divider lines; each row sits in its own subtle tile */}
      <ul className="px-3 pb-3 space-y-1">
        {rows.map((r) => {
          const isTop3 = r.rank <= 3;
          return (
            <li
              key={r.rank}
              className={cn(
                "grid grid-cols-[40px_1fr_auto_auto] gap-x-4 items-center rounded-lg px-2 py-2 transition-colors",
                r.you
                  ? "bg-[color:var(--rw-surface)]"
                  : "hover:bg-[color:var(--rw-surface-muted)]"
              )}
              style={
                isTop3
                  ? {
                      background: `linear-gradient(90deg, oklch(from ${accent} l c h / ${r.rank === 1 ? "10%" : r.rank === 2 ? "6%" : "4%"}), transparent 60%)`,
                    }
                  : undefined
              }
            >
              <RankBadge rank={r.rank} accent={accent} />
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    "truncate font-medium",
                    r.hidden && "text-muted-foreground"
                  )}
                >
                  {r.name}
                </span>
                {r.hidden ? (
                  <Eye className="size-3 text-muted-foreground shrink-0" />
                ) : null}
                {r.you ? (
                  <span
                    className="rounded-full px-1.5 py-px text-[9px] uppercase tracking-wide text-background"
                    style={{ background: accent }}
                  >
                    You
                  </span>
                ) : null}
              </span>
              <span className="text-right tabular-nums text-muted-foreground">
                {formatMoney(r.wagered, currency)}
              </span>
              <span
                className="text-right tabular-nums font-semibold"
                style={isTop3 ? { color: accent } : undefined}
              >
                {formatMoney(r.reward, currency)}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Footer — no top border; use a gradient separator so it reads as
       *  a section change rather than a hard line. */}
      <div
        className="px-5 py-3 mt-1"
        style={{
          background: `linear-gradient(180deg, oklch(from var(--jp-card-2, oklch(0.24 0.028 275)) calc(l - 0.02) c h / 60%), oklch(from var(--jp-bg, oklch(0.14 0.02 275)) l c h / 50%))`,
        }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-[0.12em]">
              Your wager
            </div>
            <div className="font-semibold tabular-nums mt-0.5">
              {formatMoney(yourWager, currency)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground uppercase tracking-[0.12em]">
              To leaderboard
            </div>
            <div className="font-semibold tabular-nums mt-0.5">
              {formatMoney(minWagerForBoard, currency)}
            </div>
          </div>
        </div>
      </div>
    </RewardShell>
  );
}
