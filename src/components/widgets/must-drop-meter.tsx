"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { Flame, Trophy } from "lucide-react";
import { RollingNumber } from "@/components/effects/rolling-number";
import { CountdownClock } from "@/components/effects/countdown-clock";
import { GlowPulse } from "@/components/effects/glow-pulse";
import { ShineSweep } from "@/components/effects/shine-sweep";
import { ConfettiBurst } from "@/components/effects/confetti-burst";
import { CoinShower } from "@/components/effects/coin-shower";
import { ThemeScope } from "@/components/widgets/theme-scope";
import { useLiveCampaign, type LiveCampaign } from "@/components/widgets/shared";
import type { ThemeTokens, WidgetConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface MustDropMeterProps {
  live: LiveCampaign;
  theme: ThemeTokens;
  config?: WidgetConfig;
  className?: string;
}

/** Pick the tier with a mustDropAmount to track, or fall back to the first. */
function pickTrackedTier(tiers: LiveCampaign["tiers"]) {
  return tiers.find((t) => t.mustDropAmount) ?? tiers[0];
}

export function MustDropMeter({
  live,
  theme,
  config,
  className,
}: MustDropMeterProps) {
  const { tiers, lastWin } = useLiveCampaign(live);
  const currency = theme.currency ?? live.campaign.currency;
  const locale = theme.locale ?? live.campaign.locale ?? "en-EU";
  const tracked = pickTrackedTier(tiers);
  const pct = Math.min(
    100,
    tracked?.mustDropAmount
      ? (tracked.currentAmount / tracked.mustDropAmount) * 100
      : (tracked?.currentAmount ?? 0) / 1000
  );
  const urgent = pct >= 80;

  const winKey = useMemo(
    () => (lastWin ? `${lastWin.campaignId}-${lastWin.timestamp}` : null),
    [lastWin]
  );

  return (
    <ThemeScope
      tokens={theme}
      className={cn(
        "relative overflow-hidden rounded-[var(--jp-radius)] border p-5 sm:p-6",
        className
      )}
      style={{
        borderColor: urgent
          ? "oklch(from var(--jp-accent) l c h / 50%)"
          : "var(--jp-border)",
        background:
          "linear-gradient(180deg, oklch(from var(--jp-card) l c h / 96%), oklch(from var(--jp-card-2) l c h / 96%))",
        boxShadow: urgent
          ? "0 0 0 1px oklch(from var(--jp-accent) l c h / 35%), 0 0 60px oklch(from var(--jp-accent) l c h / 30%)"
          : "var(--jp-shadow)",
        fontFamily: "var(--jp-font-body)",
      }}
    >
      <GlowPulse variant="beams" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "grid size-8 place-items-center rounded-full",
                urgent && "jp-pulse"
              )}
              style={{ background: "var(--jp-gradient)" }}
            >
              <Flame className="size-4" style={{ color: "oklch(0.12 0.02 275)" }} />
            </span>
            <div>
              <span
                className="block text-[11px] uppercase tracking-widest"
                style={{ color: "var(--jp-muted)" }}
              >
                Must drop before
              </span>
              <span
                className="tabular font-display text-base font-semibold"
                style={{ color: "var(--jp-text)" }}
              >
                {tracked?.mustDropAmount ? (
                  <RollingNumber
                    value={tracked.mustDropAmount}
                    currency={currency}
                    locale={locale}
                    decimals={0}
                  />
                ) : (
                  "—"
                )}
              </span>
            </div>
          </div>
          {config?.countdown && tracked?.mustDropAt ? (
            <CountdownClock
              target={tracked.mustDropAt}
              size="sm"
              showDays={false}
            />
          ) : null}
        </div>

        <div className="min-w-0">
          <span
            className="block text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "var(--jp-muted)" }}
          >
            {tracked?.displayLabel ?? live.campaign.name}
          </span>
          <div
            className="gradient-text font-display font-semibold leading-none mt-1 max-w-full overflow-hidden"
            style={{
              fontFamily: "var(--jp-font-heading)",
              fontSize: "clamp(32px, 6vw, 56px)",
            }}
          >
            <RollingNumber
              value={tracked?.currentAmount ?? 0}
              currency={currency}
              locale={locale}
              decimals={(tracked?.currentAmount ?? 0) >= 10_000 ? 0 : 2}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div
            className="relative h-3 overflow-hidden rounded-full"
            style={{ background: "oklch(from var(--jp-text) l c h / 10%)" }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 20 }}
              style={{
                background: urgent
                  ? "linear-gradient(90deg, oklch(from var(--jp-accent) l c h / 90%), oklch(from var(--jp-secondary) l c h / 90%))"
                  : "var(--jp-gradient)",
                boxShadow: urgent
                  ? "0 0 24px oklch(from var(--jp-accent) l c h / 65%)"
                  : "0 0 16px oklch(from var(--jp-primary) l c h / 45%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent 30%, oklch(1 0 0 / 10%) 50%, transparent 70%)",
                mixBlendMode: "overlay",
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs" style={{ color: "var(--jp-muted)" }}>
            <span>{pct.toFixed(1)}% toward drop</span>
            <span
              className={cn(
                "font-semibold uppercase tracking-widest",
                urgent && "text-sm"
              )}
              style={{
                color: urgent ? "var(--jp-accent)" : "var(--jp-muted)",
              }}
            >
              {urgent ? "Dropping soon" : "Heating up"}
            </span>
          </div>
        </div>
      </div>

      <ShineSweep />

      <AnimatePresence>
        {lastWin && (
          <motion.div
            key={winKey}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-x-0 top-0 z-20 flex justify-center p-2"
          >
            <div
              className="glass flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
              style={{ color: "var(--jp-text)" }}
            >
              <Trophy className="size-3.5" style={{ color: "var(--jp-accent)" }} />
              <span>
                <b>{lastWin.playerDisplay}</b> took the drop ·{" "}
                <span style={{ color: "var(--jp-accent)" }}>
                  <RollingNumber
                    value={lastWin.winAmount}
                    currency={currency}
                    locale={locale}
                    decimals={0}
                  />
                </span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CoinShower trigger={winKey} count={22} />
      <ConfettiBurst trigger={winKey} />
    </ThemeScope>
  );
}
