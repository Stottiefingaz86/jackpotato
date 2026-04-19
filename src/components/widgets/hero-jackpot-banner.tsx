"use client";

import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Dices, ArrowRight, Trophy } from "lucide-react";
import { RollingNumber } from "@/components/effects/rolling-number";
import { ThemePattern } from "@/components/effects/theme-pattern";
import { CoinShower } from "@/components/effects/coin-shower";
import { ConfettiBurst } from "@/components/effects/confetti-burst";
import { ShineSweep } from "@/components/effects/shine-sweep";
import { ThemeScope } from "@/components/widgets/theme-scope";
import { WinOverlay } from "@/components/widgets/win-overlay";
import { useLiveCampaign, type LiveCampaign } from "@/components/widgets/shared";
import type { ThemeTokens, WidgetConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface HeroJackpotBannerProps {
  live: LiveCampaign;
  theme: ThemeTokens;
  config?: WidgetConfig;
  className?: string;
  /** Use a shorter layout (for embeds with small widths) */
  compact?: boolean;
}

export function HeroJackpotBanner({
  live,
  theme,
  config,
  className,
  compact = false,
}: HeroJackpotBannerProps) {
  const { tiers, total, lastWin, pulseKey } = useLiveCampaign(live);
  const featured = tiers[0];

  const currency = theme.currency ?? live.campaign.currency;
  const locale = theme.locale ?? live.campaign.locale ?? "en-EU";

  const visibleTiers = config?.showTiers === false ? [] : tiers;

  const winKey = useMemo(
    () => (lastWin ? `${lastWin.campaignId}-${lastWin.timestamp}` : null),
    [lastWin]
  );

  const featuredAmount = featured?.currentAmount ?? total;
  // Keep the hero headline in *full* notation so you can actually see the
  // digits tick up with each bet event. Container queries + dropping the
  // cents when we're above €1k keep it from clipping at any column width.
  // Only go compact once the number is absolutely enormous (≥ €1M).
  const featuredCompact = featuredAmount >= 1_000_000;
  const featuredDecimals: 0 | 1 | 2 = featuredCompact
    ? 2
    : featuredAmount >= 1_000
      ? 0
      : 2;

  const [spinKey, setSpinKey] = useState(0);
  const [, startSpin] = useTransition();
  const campaignId = live.campaign.id;
  const tierId = featured?.tierId;

  function handleSpin(e: React.MouseEvent) {
    const href = config?.ctaUrl;
    const isPlaceholder = !href || href === "#";
    if (!isPlaceholder) return;
    e.preventDefault();
    if (!campaignId || !tierId) return;
    setSpinKey((k) => k + 1);
    startSpin(async () => {
      try {
        await fetch("/api/admin/sandbox/trigger-win", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId, tierId }),
        });
      } catch {}
    });
  }

  const celebrateKey = winKey ?? (spinKey > 0 ? `spin-${spinKey}` : null);

  // Show the dramatic full-banner "JACKPOT" overlay whenever a fresh win is
  // observed on the stream. Auto-hides so the banner returns to normal state.
  const [overlayOpen, setOverlayOpen] = useState(false);
  useEffect(() => {
    if (!winKey) return;
    setOverlayOpen(true);
    const t = window.setTimeout(() => setOverlayOpen(false), 4200);
    return () => window.clearTimeout(t);
  }, [winKey]);

  // Fire a subtle scale pulse whenever the stream ticks, without remounting
  // the RollingNumber inside (which was killing its rolling animation).
  const pulseControls = useAnimationControls();
  useEffect(() => {
    if (pulseKey === 0) return;
    pulseControls.start({
      scale: [1, 1.014, 1],
      transition: { duration: 0.6, ease: "easeOut" },
    });
  }, [pulseKey, pulseControls]);

  return (
    <ThemeScope
      tokens={theme}
      className={cn(
        "relative overflow-hidden isolate",
        "rounded-[var(--jp-radius)]",
        className
      )}
      style={{
        background:
          "radial-gradient(1200px 500px at 20% -10%, oklch(from var(--jp-primary) l c h / 28%), transparent 60%), radial-gradient(900px 500px at 100% 110%, oklch(from var(--jp-secondary) l c h / 28%), transparent 60%), linear-gradient(180deg, oklch(from var(--jp-bg) l c h / 92%), oklch(from var(--jp-card) l c h / 92%))",
        boxShadow: "var(--jp-shadow), 0 0 80px oklch(from var(--jp-primary) l c h / 14%)",
        border: "1px solid var(--jp-border)",
      }}
    >
      {/* Default to the `beams` look across the suite so the hero and the
       * must-drop card share the same signature "light lines" texture. A
       * theme can override this via `tokens.pattern` from the editor. */}
      <ThemePattern pattern={theme.pattern ?? "beams"} />
      <ShineSweep />

      <div
        className={cn(
          "relative z-10 grid gap-8 p-6 sm:p-10 lg:p-14 items-center",
          !compact && visibleTiers.length > 0 && "lg:grid-cols-[1.1fr_1fr]"
        )}
      >
        <div className="flex flex-col gap-5 min-w-0">
          <div className="flex flex-col gap-2 min-w-0">
            {/* Minimal live eyebrow — a single pulsing dot + the campaign type,
             * replacing the two noisy pills that used to sit here. The recent
             * win floats in as a toast at the top so it doesn't need a chip. */}
            <span
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em]"
              style={{ color: "var(--jp-muted)" }}
            >
              <span
                className="inline-block size-1.5 rounded-full animate-pulse"
                style={{ background: "var(--jp-accent)" }}
              />
              Live · {live.campaign.type.replace("_", " ")}
            </span>
            <h2
              className="font-display text-balance text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.05]"
              style={{
                fontFamily: "var(--jp-font-heading)",
                color: "var(--jp-text)",
              }}
            >
              {config?.headline ?? "Every spin. A chance to win."}
            </h2>
            {config?.subheadline && (
              <p className="max-w-lg text-sm sm:text-base" style={{ color: "var(--jp-muted)" }}>
                {config.subheadline}
              </p>
            )}
          </div>

          <motion.div
            animate={pulseControls}
            className="flex flex-col gap-1 min-w-0 max-w-full"
            style={{ containerType: "inline-size" }}
          >
            <span
              className="text-xs uppercase tracking-[0.2em]"
              style={{ color: "var(--jp-muted)" }}
            >
              {featured?.displayLabel ?? live.campaign.name}
            </span>
            <span
              className="gradient-text font-display font-semibold leading-[0.95] tracking-tight block whitespace-nowrap"
              style={{
                fontFamily: "var(--jp-font-heading)",
                // Size scales with the *column* width (cqi), not the viewport,
                // so the full number "€129,345" always fits regardless of
                // layout. 13cqi keeps ~8 chars comfortably inside the column.
                fontSize: visibleTiers.length > 0
                  ? "clamp(32px, 14cqi, 72px)"
                  : "clamp(56px, 17cqi, 144px)",
              }}
            >
              <RollingNumber
                value={featuredAmount}
                currency={currency}
                locale={locale}
                decimals={featuredDecimals}
                compact={featuredCompact}
              />
            </span>
            <span className="text-xs mt-1" style={{ color: "var(--jp-muted)" }}>
              Pool total{" "}
              <RollingNumber
                value={total}
                currency={currency}
                locale={locale}
                compact
                decimals={0}
                className="opacity-80"
              />
            </span>
          </motion.div>

          {config?.ctaLabel && (
            <a
              href={config.ctaUrl ?? "#"}
              onClick={handleSpin}
              className="group relative inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shine"
              style={{
                background:
                  "linear-gradient(90deg, oklch(from var(--jp-primary) l c h) 0%, oklch(from var(--jp-secondary) l c h) 100%)",
                boxShadow:
                  "0 10px 30px -10px oklch(from var(--jp-primary) l c h / 60%), inset 0 1px 0 oklch(1 0 0 / 25%)",
                textShadow: "0 1px 2px oklch(0 0 0 / 35%)",
              }}
            >
              <Dices className="size-4 transition-transform group-hover:rotate-12" />
              {config.ctaLabel}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          )}
        </div>

        {!compact && visibleTiers.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 min-w-0">
            {visibleTiers.map((t, idx) => (
              <motion.div
                key={t.tierId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx, duration: 0.35 }}
                className="group relative overflow-hidden rounded-[calc(var(--jp-radius)*0.7)] border p-4 min-w-0"
                style={{
                  borderColor: "var(--jp-border)",
                  background:
                    "linear-gradient(180deg, oklch(from var(--jp-card) l c h / 92%), oklch(from var(--jp-card-2) l c h / 92%))",
                  containerType: "inline-size",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="truncate text-[10px] uppercase tracking-widest"
                    style={{ color: "var(--jp-muted)" }}
                  >
                    {t.displayLabel}
                  </span>
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{
                      background: t.color ?? "var(--jp-primary)",
                      boxShadow: `0 0 12px ${t.color ?? "var(--jp-primary)"}`,
                    }}
                  />
                </div>
                <div
                  className="mt-2 font-display font-semibold whitespace-nowrap"
                  style={{
                    color: "var(--jp-text)",
                    // Relative to the tier card width — keeps the compacted
                    // amount ("€129K", "€25K", "€362") from ever overflowing.
                    fontSize: "clamp(16px, 18cqi, 28px)",
                  }}
                >
                  <RollingNumber
                    value={t.currentAmount}
                    currency={currency}
                    locale={locale}
                    decimals={
                      t.currentAmount >= 1_000_000
                        ? 1
                        : t.currentAmount >= 1_000
                          ? 0
                          : 2
                    }
                    compact={t.currentAmount >= 1_000}
                  />
                </div>
                {t.mustDropAmount ? (
                  <div
                    className="mt-2 h-1.5 rounded-full overflow-hidden"
                    style={{ background: "oklch(from var(--jp-text) l c h / 8%)" }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (t.currentAmount / t.mustDropAmount) * 100
                        )}%`,
                        background: "var(--jp-gradient)",
                      }}
                    />
                  </div>
                ) : null}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lastWin && (
          <motion.div
            key={winKey}
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 pointer-events-none"
          >
            <div
              className="glass inline-flex max-w-[min(80%,320px)] items-center gap-1.5 rounded-full px-3 py-1 text-[11px] sm:text-xs font-medium whitespace-nowrap overflow-hidden"
              style={{ color: "var(--jp-text)" }}
            >
              <Trophy className="size-3 shrink-0" style={{ color: "var(--jp-accent)" }} />
              <span className="truncate">
                <b>{lastWin.playerDisplay}</b>
                <span className="opacity-70"> won </span>
                <span
                  style={{ color: "var(--jp-accent)" }}
                  className="font-semibold tabular"
                >
                  <RollingNumber
                    value={lastWin.winAmount}
                    currency={currency}
                    locale={locale}
                    decimals={0}
                    compact={lastWin.winAmount >= 10_000}
                  />
                </span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CoinShower trigger={celebrateKey} count={22} />
      <ConfettiBurst trigger={celebrateKey} intensity={1.4} />

      <WinOverlay
        show={overlayOpen}
        amount={lastWin?.winAmount}
        currency={currency}
        locale={locale}
        playerDisplay={lastWin?.playerDisplay}
        onClose={() => setOverlayOpen(false)}
      />
    </ThemeScope>
  );
}
