"use client";

import { RollingNumber } from "@/components/effects/rolling-number";
import { ThemeScope } from "@/components/widgets/theme-scope";
import { ShineSweep } from "@/components/effects/shine-sweep";
import { useLiveCampaign, type LiveCampaign } from "@/components/widgets/shared";
import type { ThemeTokens, WidgetConfig } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface JackpotTiersProps {
  live: LiveCampaign;
  theme: ThemeTokens;
  config?: WidgetConfig;
  className?: string;
}

/**
 * Tier card strip — one rounded tile per jackpot tier (Mega / Daily / Hourly /
 * etc.), each with its own label, big rolling total, and helper copy. Built
 * from the same primitives as the marketing landing tiles so they look
 * identical everywhere.
 *
 * This is distinct from the Hero Banner (which shows a single, large total
 * plus CTA) and from the Must-Drop Meter (which focuses on countdown
 * tension on one tier). Tier cards are for the "show me all the pools at a
 * glance" layout — promo strips, lobby headers, campaign pages.
 */
export function JackpotTiers({
  live,
  theme,
  config,
  className,
}: JackpotTiersProps) {
  const { tiers, total } = useLiveCampaign(live);
  const currency = theme.currency ?? live.campaign.currency;
  const locale = theme.locale ?? live.campaign.locale ?? "en-EU";

  // If the campaign has no tiers, fall back to a single aggregate tile so
  // the widget still reads as configured. Rare in practice but keeps the
  // preview resilient.
  const items =
    tiers.length > 0
      ? tiers.map((t) => ({
          tierId: t.tierId,
          label: t.displayLabel || t.name,
          tagline: t.mustDropAmount
            ? `Must drop before ${formatCompact(t.mustDropAmount, currency, locale)}`
            : undefined,
          amount: t.currentAmount,
          color: t.color,
        }))
      : [
          {
            tierId: "agg",
            label: live.campaign.name,
            tagline: "Live pool",
            amount: total,
            color: undefined,
          },
        ];

  return (
    <ThemeScope
      tokens={theme}
      className={cn(
        "grid gap-3 sm:gap-4",
        items.length === 1 && "grid-cols-1",
        items.length === 2 && "grid-cols-1 sm:grid-cols-2",
        items.length >= 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {items.map((t) => (
        <TierCard
          key={t.tierId}
          label={t.label}
          tagline={t.tagline}
          amount={t.amount}
          currency={currency}
          locale={locale}
          highlightColor={t.color}
          pulse={config?.pulse}
        />
      ))}
    </ThemeScope>
  );
}

function TierCard({
  label,
  tagline,
  amount,
  currency,
  locale,
  highlightColor,
  pulse,
}: {
  label: string;
  tagline?: string;
  amount: number;
  currency: string;
  locale: string;
  highlightColor?: string;
  pulse?: boolean;
}) {
  // Per-tier accent lets each tile feel distinct (Mega purple, Daily gold,
  // Hourly red) even when the overall theme is unified. Falls back to the
  // current theme accent variable.
  const accent = highlightColor ?? "var(--jp-accent)";

  return (
    <div
      // `container-type: inline-size` lets us size the big total using `cqi`
      // units below, which scale to the card's own width instead of the
      // viewport. That's what keeps "$100,380" fitting the tile whether the
      // grid is 1 / 2 / 3 columns wide.
      className="group relative overflow-hidden rounded-3xl border jp-animated-border p-5 sm:p-6 [container-type:inline-size]"
      style={{
        borderColor: "var(--jp-border)",
        background: [
          `radial-gradient(520px 260px at 0% 0%, ${toAlpha(accent, 0.18)}, transparent 65%)`,
          `radial-gradient(520px 260px at 100% 100%, oklch(from var(--jp-primary) l c h / 14%), transparent 65%)`,
          "linear-gradient(180deg, oklch(from var(--jp-card) l c h / 94%), oklch(from var(--jp-card-2) l c h / 96%))",
        ].join(","),
        boxShadow: "var(--jp-shadow)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          backgroundImage:
            "radial-gradient(oklch(1 0 0 / 45%) 1px, transparent 1.4px)",
          backgroundSize: "18px 18px",
          opacity: 0.06,
          maskImage:
            "radial-gradient(120% 120% at 50% 50%, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(120% 120% at 50% 50%, black 20%, transparent 75%)",
        }}
      />

      <div className="relative z-[2] flex min-w-0 flex-col gap-1">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: "var(--jp-muted)" }}
        >
          <span
            aria-hidden
            className={cn(
              "inline-block size-1.5 rounded-full",
              pulse && "jp-pulse"
            )}
            style={{ backgroundColor: accent }}
          />
          {label}
        </span>
        <motion.div
          className="gradient-text font-display font-semibold leading-none drop-shadow-[0_2px_10px_oklch(from_var(--jp-primary)_l_c_h/35%)] tabular"
          style={{
            fontFamily: "var(--jp-font-heading)",
            // Scale the total to the card's own width via container query
            // inline-size units. 14cqi works for 7-ish character values like
            // "$100,380" without clipping on a 260px-wide tile.
            fontSize: "clamp(22px, 14cqi, 52px)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "clip",
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <RollingNumber
            value={amount}
            currency={currency}
            locale={locale}
            // Drop decimals earlier so narrow tiles don't clip the cents.
            decimals={amount >= 10_000 ? 0 : 2}
            compact={amount >= 1_000_000}
          />
        </motion.div>
        {tagline ? (
          <span
            className="text-xs mt-1 truncate"
            style={{ color: "var(--jp-muted)" }}
          >
            {tagline}
          </span>
        ) : null}
      </div>

      <ShineSweep />
    </div>
  );
}

function formatCompact(n: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      notation: n >= 10_000 ? "compact" : "standard",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString()}`;
  }
}

/**
 * If a hex / oklch color is given, convert to a translucent wrapper so the
 * accent can tint the radial gradient without swallowing the card. Falls
 * back to a safe oklch relative syntax for CSS variables.
 */
function toAlpha(color: string, alpha: number) {
  const pct = Math.round(alpha * 100);
  if (color.startsWith("var(")) {
    return `oklch(from ${color} l c h / ${pct}%)`;
  }
  if (color.startsWith("#")) {
    const a = Math.round(alpha * 255)
      .toString(16)
      .padStart(2, "0");
    // Expand short hex to long form first so we can append alpha.
    const hex =
      color.length === 4
        ? "#" +
          color
            .slice(1)
            .split("")
            .map((c) => c + c)
            .join("")
        : color.slice(0, 7);
    return `${hex}${a}`;
  }
  return color;
}
