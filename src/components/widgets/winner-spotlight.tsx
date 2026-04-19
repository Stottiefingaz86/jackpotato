"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";
import { RollingNumber } from "@/components/effects/rolling-number";
import { ShineSweep } from "@/components/effects/shine-sweep";
import { ThemeScope } from "@/components/widgets/theme-scope";
import { useJackpotStream } from "@/hooks/use-jackpot-stream";
import type { JackpotWin, ThemeTokens, WidgetConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface WinnerSpotlightWidgetProps {
  /** Seed pool — normally the 20 most recent wins. */
  initial: JackpotWin[];
  theme: ThemeTokens;
  config?: WidgetConfig;
  className?: string;
  currency?: string;
  locale?: string;
}

function flagEmoji(country?: string) {
  if (!country) return "🏳️";
  const cc = country.toUpperCase();
  if (cc.length !== 2) return "🏳️";
  return String.fromCodePoint(...[...cc].map((c) => 127397 + c.charCodeAt(0)));
}

function timeAgo(iso: string) {
  const diff = Date.now() - Date.parse(iso);
  const mins = Math.max(1, Math.floor(diff / 60_000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/**
 * The Winner Spotlight is a hero-sized celebration card that surfaces the
 * single biggest recent win. It's designed to anchor lobby/landing pages
 * with a flagship "someone just won BIG" moment that rotates automatically
 * as bigger wins stream in.
 */
export function WinnerSpotlightWidget({
  initial,
  theme,
  config,
  className,
  currency,
  locale,
}: WinnerSpotlightWidgetProps) {
  const stream = useJackpotStream();
  const effCurrency = currency ?? theme.currency ?? "EUR";
  const effLocale = locale ?? theme.locale ?? "en-EU";
  const showCountry = config?.showCountry !== false;

  // Roll together seed + live wins. We keep the pool sorted by amount desc and
  // surface whichever win is currently biggest within the last hour.
  const [livePool, setLivePool] = useState<
    Array<Pick<JackpotWin, "displayName" | "country" | "winAmount" | "wonAt">>
  >([]);

  useEffect(() => {
    const latest = stream.recentWins[0];
    if (!latest) return;
    setLivePool((arr) => {
      if (arr.some((r) => r.wonAt === latest.timestamp)) return arr;
      const next = [
        {
          displayName: latest.playerDisplay,
          country: latest.country,
          winAmount: latest.winAmount,
          wonAt: latest.timestamp,
        },
        ...arr,
      ].slice(0, 50);
      return next;
    });
  }, [stream.recentWins]);

  const hero = useMemo(() => {
    const pool = [...initial, ...livePool];
    if (pool.length === 0) return null;
    return [...pool].sort((a, b) => b.winAmount - a.winAmount)[0];
  }, [initial, livePool]);

  const heroKey = hero ? `${hero.displayName}-${hero.wonAt}` : "empty";

  return (
    <ThemeScope
      tokens={theme}
      className={cn(
        "relative overflow-hidden rounded-[var(--jp-radius)] border shine",
        className
      )}
      style={{
        borderColor: "var(--jp-border)",
        background:
          "radial-gradient(800px 260px at 50% -10%, oklch(from var(--jp-primary) l c h / 30%), transparent 60%), linear-gradient(180deg, oklch(from var(--jp-card) l c h / 96%), oklch(from var(--jp-card-2) l c h / 96%))",
        boxShadow: "var(--jp-shadow)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: "var(--jp-gradient)" }}
      />
      <div className="flex items-center justify-between px-5 pt-4">
        <span
          className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em]"
          style={{ color: "var(--jp-muted)" }}
        >
          <span
            className="size-1.5 rounded-full animate-pulse"
            style={{ background: "var(--jp-accent)" }}
          />
          Biggest recent win
        </span>
        <span
          className="text-[10px] uppercase tracking-widest"
          style={{ color: "var(--jp-muted)" }}
        >
          {hero ? timeAgo(hero.wonAt) : ""}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {hero ? (
          <motion.div
            key={heroKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="px-5 pb-5 pt-3"
            style={{ containerType: "inline-size" }}
          >
            <div className="flex items-center gap-3">
              <span
                className="grid size-12 shrink-0 place-items-center rounded-full"
                style={{
                  background: "var(--jp-gradient)",
                  boxShadow: "var(--jp-glow)",
                }}
              >
                <Trophy
                  className="size-6"
                  style={{ color: "oklch(0.12 0.02 275)" }}
                />
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className="flex items-center gap-1.5 text-sm"
                  style={{ color: "var(--jp-muted)" }}
                >
                  {showCountry && (
                    <span className="text-base leading-none">
                      {flagEmoji(hero.country)}
                    </span>
                  )}
                  <span className="truncate">
                    <b style={{ color: "var(--jp-text)" }}>{hero.displayName}</b>{" "}
                    just won
                  </span>
                </div>
                <div
                  className="gradient-text font-display font-semibold leading-[1.05] mt-1 whitespace-nowrap"
                  style={{
                    fontFamily: "var(--jp-font-heading)",
                    fontSize: "clamp(32px, 14cqi, 72px)",
                  }}
                >
                  <RollingNumber
                    value={hero.winAmount}
                    currency={effCurrency}
                    locale={effLocale}
                    decimals={0}
                    compact={hero.winAmount >= 1_000_000}
                  />
                </div>
              </div>
            </div>
            {config?.clickDestination && (
              <a
                href={config.clickDestination}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-semibold text-white shine"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(from var(--jp-primary) l c h) 0%, oklch(from var(--jp-secondary) l c h) 100%)",
                  boxShadow:
                    "0 10px 26px -10px oklch(from var(--jp-primary) l c h / 60%), inset 0 1px 0 oklch(1 0 0 / 25%)",
                  textShadow: "0 1px 2px oklch(0 0 0 / 35%)",
                }}
              >
                <Sparkles className="size-4" />
                {config?.ctaLabel ?? "You could be next"}
              </a>
            )}
          </motion.div>
        ) : (
          <div
            className="grid h-28 place-items-center px-5 pb-5 text-xs"
            style={{ color: "var(--jp-muted)" }}
          >
            Waiting for the next big win…
          </div>
        )}
      </AnimatePresence>

      <ShineSweep />
    </ThemeScope>
  );
}
