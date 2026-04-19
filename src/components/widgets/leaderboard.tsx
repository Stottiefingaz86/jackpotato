"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown, Flame, Medal, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { RollingNumber } from "@/components/effects/rolling-number";
import { ThemeScope } from "@/components/widgets/theme-scope";
import { useJackpotStream } from "@/hooks/use-jackpot-stream";
import type {
  JackpotWin,
  LeaderboardMetric,
  LeaderboardPeriod,
  ThemeTokens,
  WidgetConfig,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export interface LeaderboardWidgetProps {
  /** Seeded set of wins used to build the initial standings. */
  initial: JackpotWin[];
  theme: ThemeTokens;
  config?: WidgetConfig;
  className?: string;
  currency?: string;
  locale?: string;
}

interface LeaderRow {
  key: string;
  displayName: string;
  country?: string;
  totalWon: number;
  wins: number;
  biggestWin: number;
  lastWonAt: string;
}

const PERIOD_MS: Record<LeaderboardPeriod, number> = {
  "24h": 24 * 3600_000,
  "7d": 7 * 24 * 3600_000,
  "30d": 30 * 24 * 3600_000,
  all_time: Number.POSITIVE_INFINITY,
};

const PERIOD_LABEL: Record<LeaderboardPeriod, string> = {
  "24h": "Last 24h",
  "7d": "This week",
  "30d": "This month",
  all_time: "All time",
};

const METRIC_LABEL: Record<LeaderboardMetric, string> = {
  total_won: "Total won",
  wins: "Wins",
  biggest_win: "Biggest win",
};

function flagEmoji(country?: string) {
  if (!country) return "🏳️";
  const cc = country.toUpperCase();
  if (cc.length !== 2) return "🏳️";
  return String.fromCodePoint(...[...cc].map((c) => 127397 + c.charCodeAt(0)));
}

function rankIcon(idx: number) {
  if (idx === 0) return Crown;
  if (idx === 1) return Medal;
  if (idx === 2) return Trophy;
  return Flame;
}

function rankColor(idx: number) {
  if (idx === 0) return "var(--jp-accent)";
  if (idx === 1) return "var(--jp-primary)";
  if (idx === 2) return "var(--jp-secondary)";
  return "var(--jp-muted)";
}

/**
 * Aggregate a flat list of jackpot wins into a ranked roster.
 *
 * The widget keeps the seed wins + any realtime wins that land while it's
 * mounted, then filters by the configured period window and ranks players
 * on the chosen metric. It's intentionally pure of network calls — the
 * SSE stream feeds it a live tail that's merged client-side.
 */
function aggregate(
  wins: LeaderRow[],
  metric: LeaderboardMetric,
  limit: number
): LeaderRow[] {
  const sorted = [...wins].sort((a, b) => {
    if (metric === "wins") return b.wins - a.wins;
    if (metric === "biggest_win") return b.biggestWin - a.biggestWin;
    return b.totalWon - a.totalWon;
  });
  return sorted.slice(0, limit);
}

export function LeaderboardWidget({
  initial,
  theme,
  config,
  className,
  currency,
  locale,
}: LeaderboardWidgetProps) {
  const stream = useJackpotStream();
  const period: LeaderboardPeriod = config?.leaderboardPeriod ?? "7d";
  const metric: LeaderboardMetric = config?.leaderboardMetric ?? "total_won";
  const max = Math.min(config?.maxItems ?? 8, 12);
  const effCurrency = currency ?? theme.currency ?? "EUR";
  const effLocale = locale ?? theme.locale ?? "en-EU";
  const showCountry = config?.showCountry !== false;

  // Keep a rolling tail of live wins so the board moves as events stream in.
  // We dedupe by timestamp so the same SSE event doesn't double-count.
  const [liveTail, setLiveTail] = useState<
    Array<Pick<JackpotWin, "displayName" | "country" | "winAmount" | "wonAt">>
  >([]);

  useEffect(() => {
    const latest = stream.recentWins[0];
    if (!latest) return;
    setLiveTail((arr) => {
      const seen = arr.find((r) => r.wonAt === latest.timestamp);
      if (seen) return arr;
      const next = [
        {
          displayName: latest.playerDisplay,
          country: latest.country,
          winAmount: latest.winAmount,
          wonAt: latest.timestamp,
        },
        ...arr,
      ].slice(0, 40);
      return next;
    });
  }, [stream.recentWins]);

  const rows = useMemo<LeaderRow[]>(() => {
    const cutoff = Date.now() - PERIOD_MS[period];
    const pool = [...initial, ...liveTail].filter(
      (w) => Date.parse(w.wonAt) >= cutoff
    );
    const by = new Map<string, LeaderRow>();
    for (const w of pool) {
      const key = `${w.displayName}|${w.country ?? ""}`;
      const cur = by.get(key) ?? {
        key,
        displayName: w.displayName,
        country: w.country,
        totalWon: 0,
        wins: 0,
        biggestWin: 0,
        lastWonAt: w.wonAt,
      };
      cur.totalWon += w.winAmount;
      cur.wins += 1;
      cur.biggestWin = Math.max(cur.biggestWin, w.winAmount);
      if (Date.parse(w.wonAt) > Date.parse(cur.lastWonAt)) {
        cur.lastWonAt = w.wonAt;
      }
      by.set(key, cur);
    }
    return aggregate([...by.values()], metric, max);
  }, [initial, liveTail, period, metric, max]);

  const metricValue = (row: LeaderRow) => {
    if (metric === "wins") return row.wins;
    if (metric === "biggest_win") return row.biggestWin;
    return row.totalWon;
  };

  const isCurrency = metric !== "wins";

  return (
    <ThemeScope
      tokens={theme}
      className={cn(
        "relative overflow-hidden rounded-[var(--jp-radius)] border",
        className
      )}
      style={{
        borderColor: "var(--jp-border)",
        background:
          "linear-gradient(180deg, oklch(from var(--jp-card) l c h / 96%), oklch(from var(--jp-card-2) l c h / 96%))",
        boxShadow: "var(--jp-shadow)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: "var(--jp-gradient)" }}
      />
      <div className="flex items-center justify-between gap-3 px-4 pt-3">
        <div className="flex items-center gap-2">
          <span
            className="grid size-7 place-items-center rounded-full"
            style={{ background: "var(--jp-gradient)" }}
          >
            <Crown className="size-4" style={{ color: "oklch(0.12 0.02 275)" }} />
          </span>
          <div className="flex flex-col leading-tight">
            <span
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "var(--jp-muted)" }}
            >
              {config?.headline ?? "Leaderboard"}
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--jp-text)" }}
            >
              {METRIC_LABEL[metric]} · {PERIOD_LABEL[period]}
            </span>
          </div>
        </div>
        <span
          className="text-[10px] uppercase tracking-widest"
          style={{ color: "var(--jp-muted)" }}
        >
          Top {rows.length || max}
        </span>
      </div>

      <ol className="flex flex-col gap-1 p-3">
        {rows.length === 0 && (
          <li
            className="grid h-20 place-items-center rounded-md border border-dashed text-xs"
            style={{ borderColor: "var(--jp-border)", color: "var(--jp-muted)" }}
          >
            No qualifying wins yet in this window.
          </li>
        )}
        {rows.map((row, idx) => {
          const Icon = rankIcon(idx);
          const color = rankColor(idx);
          const highlight = idx < 3;
          return (
            <motion.li
              key={row.key}
              layout
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className={cn(
                "flex items-center gap-3 rounded-md px-2 py-1.5",
                highlight && "border"
              )}
              style={
                highlight
                  ? {
                      borderColor: "var(--jp-border)",
                      background:
                        "linear-gradient(90deg, oklch(from var(--jp-card-2) l c h / 70%), transparent)",
                    }
                  : undefined
              }
            >
              <span
                className="grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold tabular"
                style={{
                  background: highlight
                    ? "oklch(from var(--jp-card-2) l c h / 80%)"
                    : "transparent",
                  color,
                }}
              >
                {idx < 3 ? <Icon className="size-3.5" /> : idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className="flex items-center gap-1.5 truncate text-sm"
                  style={{ color: "var(--jp-text)" }}
                >
                  {showCountry && (
                    <span className="text-[13px] leading-none">
                      {flagEmoji(row.country)}
                    </span>
                  )}
                  <span className="truncate font-medium">{row.displayName}</span>
                </div>
                <div
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: "var(--jp-muted)" }}
                >
                  {row.wins} win{row.wins === 1 ? "" : "s"}
                </div>
              </div>
              <div
                className="tabular text-sm font-semibold shrink-0"
                style={{ color: idx === 0 ? "var(--jp-accent)" : "var(--jp-text)" }}
              >
                {isCurrency ? (
                  <RollingNumber
                    value={metricValue(row)}
                    currency={effCurrency}
                    locale={effLocale}
                    decimals={0}
                    compact={metricValue(row) >= 100_000}
                  />
                ) : (
                  metricValue(row)
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </ThemeScope>
  );
}
