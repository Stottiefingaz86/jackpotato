"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { RollingNumber } from "@/components/effects/rolling-number";
import { ThemeScope } from "@/components/widgets/theme-scope";
import { useJackpotStream } from "@/hooks/use-jackpot-stream";
import type { ThemeTokens, WidgetConfig, JackpotWin } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface RecentWinnerTickerProps {
  initial: JackpotWin[];
  theme: ThemeTokens;
  config?: WidgetConfig;
  className?: string;
  /** Force a currency/locale (for gallery demos). */
  currency?: string;
  locale?: string;
}

function flagEmoji(country?: string) {
  if (!country) return "🏳️";
  const cc = country.toUpperCase();
  if (cc.length !== 2) return "🏳️";
  return String.fromCodePoint(
    ...[...cc].map((c) => 127397 + c.charCodeAt(0))
  );
}

function anonymize(name: string) {
  const first = name.trim().split(" ")[0] ?? "";
  if (first.length <= 1) return "Player";
  return `${first[0]}${"•".repeat(Math.max(2, first.length - 2))}`;
}

type TickerItem = Pick<
  JackpotWin,
  "id" | "displayName" | "country" | "winAmount"
> & {
  currency?: string;
  campaignName?: string;
  ts: string;
  fresh?: boolean;
};

export function RecentWinnerTicker({
  initial,
  theme,
  config,
  className,
  currency,
  locale,
}: RecentWinnerTickerProps) {
  const stream = useJackpotStream();
  const effCurrency = currency ?? theme.currency ?? "EUR";
  const effLocale = locale ?? theme.locale ?? "en-EU";
  const mode = config?.tickerMode ?? "ticker";
  const max = config?.maxItems ?? 20;

  const [items, setItems] = useState<TickerItem[]>(() =>
    initial.slice(0, max).map((w) => ({
      id: w.id,
      displayName: w.displayName,
      country: w.country,
      winAmount: w.winAmount,
      ts: w.wonAt,
    }))
  );

  useEffect(() => {
    const latest = stream.recentWins[0];
    if (!latest) return;
    setItems((arr) => {
      const id = `live_${latest.timestamp}`;
      if (arr[0]?.id === id) return arr;
      const next: TickerItem = {
        id,
        displayName: latest.playerDisplay,
        country: latest.country,
        winAmount: latest.winAmount,
        ts: latest.timestamp,
        fresh: true,
      };
      return [next, ...arr].slice(0, max);
    });
  }, [stream.recentWins, max]);

  // Toast mode: show one item that fades in, out, and rotates.
  const [toastIdx, setToastIdx] = useState(0);
  useEffect(() => {
    if (mode !== "toast") return;
    const speed = (config?.autoRotateSpeed ?? 4.5) * 1000;
    const id = window.setInterval(() => {
      setToastIdx((v) => (v + 1) % Math.max(1, items.length));
    }, speed);
    return () => window.clearInterval(id);
  }, [mode, items.length, config?.autoRotateSpeed]);

  const display = (label: string) =>
    config?.anonymize ? anonymize(label) : label;

  // Duplicate items for seamless marquee loop
  const marqueeList = useMemo(() => [...items, ...items], [items]);

  if (mode === "toast") {
    const it = items[toastIdx];
    return (
      <ThemeScope
        tokens={theme}
        className={cn("pointer-events-auto", className)}
      >
        <AnimatePresence mode="wait">
          {it && (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="flex items-center gap-3 rounded-full border py-2.5 pl-2 pr-4 shine"
              style={{
                borderColor: "var(--jp-border)",
                background:
                  "linear-gradient(180deg, oklch(from var(--jp-card) l c h / 96%), oklch(from var(--jp-card-2) l c h / 96%))",
                boxShadow: "var(--jp-shadow)",
                color: "var(--jp-text)",
              }}
            >
              <span
                className="grid size-9 place-items-center rounded-full"
                style={{ background: "var(--jp-gradient)" }}
              >
                <Trophy className="size-4" style={{ color: "oklch(0.12 0.02 275)" }} />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--jp-muted)" }}>
                  Recent winner
                </span>
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  {config?.showFlag !== false && (
                    <span>{flagEmoji(it.country)}</span>
                  )}
                  {display(it.displayName)}
                  <span style={{ color: "var(--jp-accent)" }} className="tabular">
                    <RollingNumber
                      value={it.winAmount}
                      currency={effCurrency}
                      locale={effLocale}
                      decimals={0}
                    />
                  </span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ThemeScope>
    );
  }

  return (
    <ThemeScope
      tokens={theme}
      className={cn(
        "relative overflow-hidden rounded-full border",
        className
      )}
      style={{
        borderColor: "var(--jp-border)",
        background:
          "linear-gradient(90deg, oklch(from var(--jp-card) l c h / 92%), oklch(from var(--jp-card-2) l c h / 92%))",
        boxShadow: "var(--jp-shadow)",
      }}
    >
      {/* Fade masks on edges for a cinematic look */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10"
        style={{
          background:
            "linear-gradient(90deg, oklch(from var(--jp-card) l c h / 100%), transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10"
        style={{
          background:
            "linear-gradient(270deg, oklch(from var(--jp-card) l c h / 100%), transparent)",
        }}
      />
      <div className="relative flex items-center gap-2 py-2">
        <span
          className="ml-3 grid size-6 place-items-center rounded-full shrink-0"
          style={{ background: "var(--jp-gradient)" }}
        >
          <Trophy className="size-3" style={{ color: "oklch(0.12 0.02 275)" }} />
        </span>
        <div className="jp-marquee flex items-center gap-8 min-w-max pr-8">
          {marqueeList.map((w, idx) => (
            <span
              key={`${w.id}-${idx}`}
              className={cn(
                "flex items-center gap-1.5 text-sm tabular",
                w.fresh && "animate-pulse"
              )}
              style={{ color: "var(--jp-text)" }}
            >
              {config?.showFlag !== false && (
                <span className="text-base leading-none">
                  {flagEmoji(w.country)}
                </span>
              )}
              <b className="font-semibold">{display(w.displayName)}</b>
              <span style={{ color: "var(--jp-muted)" }}>won</span>
              <span style={{ color: "var(--jp-accent)" }} className="font-semibold">
                <RollingNumber
                  value={w.winAmount}
                  currency={effCurrency}
                  locale={effLocale}
                  decimals={0}
                />
              </span>
              <span
                className="mx-2 inline-block size-1 rounded-full"
                style={{ background: "var(--jp-muted)", opacity: 0.4 }}
              />
            </span>
          ))}
        </div>
      </div>
    </ThemeScope>
  );
}
