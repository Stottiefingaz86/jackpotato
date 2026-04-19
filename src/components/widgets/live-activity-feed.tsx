"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useMemo } from "react";
import { Flame, Trophy, Sparkles } from "lucide-react";
import { ThemeScope } from "@/components/widgets/theme-scope";
import {
  useJackpotStream,
} from "@/hooks/use-jackpot-stream";
import type {
  JackpotWin,
  RealtimeEvent,
  ThemeTokens,
  WidgetConfig,
} from "@/lib/types";
import { formatMoney } from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface LiveActivityFeedProps {
  /** Seeded recent wins shown before the stream delivers anything. */
  initial: JackpotWin[];
  theme: ThemeTokens;
  config?: WidgetConfig;
  className?: string;
  currency?: string;
  locale?: string;
}

type FeedRow =
  | {
      kind: "win";
      id: string;
      ts: string;
      playerDisplay: string;
      country?: string;
      winAmount: number;
      tierLabel?: string;
    }
  | {
      kind: "bet";
      id: string;
      ts: string;
      stakeAmount: number;
      currency: string;
      gameId: string;
    }
  | {
      kind: "milestone";
      id: string;
      ts: string;
      label: string;
    };

function relTime(iso: string, now: number) {
  const delta = Math.max(0, now - Date.parse(iso));
  if (delta < 10_000) return "just now";
  if (delta < 60_000) return `${Math.round(delta / 1000)}s ago`;
  if (delta < 3_600_000) return `${Math.round(delta / 60_000)}m ago`;
  if (delta < 86_400_000) return `${Math.round(delta / 3_600_000)}h ago`;
  return `${Math.round(delta / 86_400_000)}d ago`;
}

/**
 * Vertical, chat-style activity feed. Mixes recent jackpot wins, big bets
 * and milestone events into a single reverse-chronological list. Great as
 * a sidebar on promo pages or lobbies where the horizontal ticker would
 * be too small to read.
 */
export function LiveActivityFeed({
  initial,
  theme,
  config,
  className,
  currency,
  locale,
}: LiveActivityFeedProps) {
  const stream = useJackpotStream();
  const effCurrency = currency ?? theme.currency ?? "EUR";
  const effLocale = locale ?? theme.locale ?? "en-EU";
  // Keep the feed a fixed size so live updates don't push surrounding page
  // content up and down every time a new event drops in. The default of 5
  // plays nicely inside sidebars and stacked marketing layouts.
  const max = config?.maxItems ?? 5;
  // Each row renders as an icon + two text lines (≈52px).
  const ROW_PX = 52;

  const wantsBets = config?.showAmount !== false;

  const formatAmt = useCallback(
    (n: number, c: string) =>
      formatMoney(n, c, effLocale, {
        compact: n >= 10_000,
        decimals: 0,
      }),
    [effLocale]
  );

  const rows = useMemo<FeedRow[]>(() => {
    const seeded: FeedRow[] = initial.slice(0, max).map((w) => ({
      kind: "win",
      id: `seed-${w.id}`,
      ts: w.wonAt,
      playerDisplay: w.playerDisplay,
      country: w.country,
      winAmount: w.winAmount,
    }));

    const streamed: FeedRow[] = [];
    for (const e of stream.recentEvents) {
      if (e.type === "jackpot.won") {
        streamed.push({
          kind: "win",
          id: `live-${e.campaignId}-${e.tierId}-${e.timestamp}`,
          ts: e.timestamp,
          playerDisplay: e.playerDisplay,
          country: e.country,
          winAmount: e.winAmount,
        });
      } else if (wantsBets && e.type === "bet.ingested" && e.stakeAmount >= 10) {
        streamed.push({
          kind: "bet",
          id: `bet-${e.timestamp}-${e.gameId}`,
          ts: e.timestamp,
          stakeAmount: e.stakeAmount,
          currency: e.currency,
          gameId: e.gameId,
        });
      } else if (
        e.type === "campaign.paused" ||
        e.type === "campaign.resumed"
      ) {
        const ev = e as Extract<
          RealtimeEvent,
          { type: "campaign.paused" | "campaign.resumed" }
        >;
        streamed.push({
          kind: "milestone",
          id: `ms-${ev.type}-${ev.timestamp}`,
          ts: ev.timestamp,
          label:
            ev.type === "campaign.paused"
              ? "Campaign paused"
              : "Campaign resumed",
        });
      }
    }

    const combined = [...streamed, ...seeded];
    // Dedupe by id (streamed is newer and wins).
    const seen = new Set<string>();
    const deduped: FeedRow[] = [];
    for (const r of combined) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      deduped.push(r);
    }
    deduped.sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts));
    return deduped.slice(0, max);
  }, [initial, stream.recentEvents, max, wantsBets]);

  const now = Date.now();

  return (
    <ThemeScope
      tokens={theme}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[var(--jp-radius)] border",
        className
      )}
      style={{
        borderColor: "var(--jp-border)",
        background:
          "linear-gradient(180deg, oklch(from var(--jp-card) l c h / 96%), oklch(from var(--jp-card-2) l c h / 96%))",
        boxShadow: "var(--jp-shadow)",
        fontFamily: "var(--jp-font-body)",
      }}
    >
      <div
        className="flex items-center justify-between gap-2 border-b px-4 py-3"
        style={{ borderColor: "var(--jp-border)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-flex size-6 place-items-center rounded-full"
            style={{ background: "var(--jp-gradient)" }}
          >
            <Sparkles
              className="size-3 m-auto"
              style={{ color: "oklch(0.12 0.02 275)" }}
            />
          </span>
          <div className="flex flex-col leading-tight">
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--jp-text)" }}
            >
              {config?.headline ?? "Live activity"}
            </span>
            <span
              className="text-[10px] uppercase tracking-[0.22em]"
              style={{ color: "var(--jp-muted)" }}
            >
              {stream.connected ? "Streaming" : "Idle"}
            </span>
          </div>
        </div>
        <span
          className="inline-block size-1.5 rounded-full"
          style={{
            background: stream.connected ? "var(--jp-accent)" : "var(--jp-muted)",
            boxShadow: stream.connected
              ? "0 0 8px var(--jp-accent)"
              : "none",
          }}
        />
      </div>

      <ul
        className="relative flex flex-col divide-y overflow-hidden"
        style={{
          borderColor: "var(--jp-border)",
          // Reserve a fixed window so the widget occupies the same space no
          // matter how many events have rolled through.
          height: `${ROW_PX * max}px`,
        }}
      >
        {rows.length === 0 && (
          <div
            className="absolute inset-0 grid place-items-center text-xs"
            style={{ color: "var(--jp-muted)" }}
          >
            Waiting for the next big spin…
          </div>
        )}
        <AnimatePresence initial={false}>
          {rows.map((r) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex shrink-0 items-center gap-3 px-4 py-2.5 text-sm"
              style={{
                borderColor: "var(--jp-border)",
                height: `${ROW_PX}px`,
              }}
            >
              {r.kind === "win" ? (
                <WinRow
                  row={r}
                  now={now}
                  currency={effCurrency}
                  format={formatAmt}
                />
              ) : r.kind === "bet" ? (
                <BetRow row={r} now={now} format={formatAmt} />
              ) : (
                <MilestoneRow row={r} now={now} />
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

    </ThemeScope>
  );
}

function WinRow({
  row,
  now,
  currency,
  format,
}: {
  row: Extract<FeedRow, { kind: "win" }>;
  now: number;
  currency: string;
  format: (n: number, c: string) => string;
}) {
  return (
    <>
      <span
        className="inline-flex size-7 shrink-0 place-items-center rounded-full"
        style={{
          background: "oklch(from var(--jp-accent) l c h / 18%)",
          color: "var(--jp-accent)",
        }}
      >
        <Trophy className="size-3.5 m-auto" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate" style={{ color: "var(--jp-text)" }}>
          <b>{row.playerDisplay}</b>
          <span className="opacity-70"> won </span>
          <span
            style={{ color: "var(--jp-accent)" }}
            className="font-semibold tabular"
          >
            {format(row.winAmount, currency)}
          </span>
        </span>
        <span
          className="text-[11px]"
          style={{ color: "var(--jp-muted)" }}
        >
          {row.country ? `${row.country} · ` : ""}
          {relTime(row.ts, now)}
        </span>
      </div>
    </>
  );
}

function BetRow({
  row,
  now,
  format,
}: {
  row: Extract<FeedRow, { kind: "bet" }>;
  now: number;
  format: (n: number, c: string) => string;
}) {
  return (
    <>
      <span
        className="inline-flex size-7 shrink-0 place-items-center rounded-full"
        style={{
          background: "oklch(from var(--jp-secondary) l c h / 16%)",
          color: "var(--jp-secondary)",
        }}
      >
        <Flame className="size-3.5 m-auto" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate" style={{ color: "var(--jp-text)" }}>
          <span className="opacity-70">Big bet on </span>
          <b>{row.gameId}</b>
          <span className="opacity-70"> · </span>
          <span className="font-semibold tabular">
            {format(row.stakeAmount, row.currency)}
          </span>
        </span>
        <span
          className="text-[11px]"
          style={{ color: "var(--jp-muted)" }}
        >
          {relTime(row.ts, now)}
        </span>
      </div>
    </>
  );
}

function MilestoneRow({
  row,
  now,
}: {
  row: Extract<FeedRow, { kind: "milestone" }>;
  now: number;
}) {
  return (
    <>
      <span
        className="inline-flex size-7 shrink-0 place-items-center rounded-full"
        style={{
          background: "oklch(from var(--jp-muted) l c h / 18%)",
          color: "var(--jp-muted)",
        }}
      >
        <Sparkles className="size-3.5 m-auto" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span style={{ color: "var(--jp-text)" }}>{row.label}</span>
        <span
          className="text-[11px]"
          style={{ color: "var(--jp-muted)" }}
        >
          {relTime(row.ts, now)}
        </span>
      </div>
    </>
  );
}
