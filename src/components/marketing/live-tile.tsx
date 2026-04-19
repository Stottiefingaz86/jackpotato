"use client";

import { RollingNumber } from "@/components/effects/rolling-number";
import { ThemeScope } from "@/components/widgets/theme-scope";
import { ShineSweep } from "@/components/effects/shine-sweep";
import { useLiveCampaign, type LiveCampaign } from "@/components/widgets/shared";
import type { ThemeTokens } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function LiveTile({
  live,
  theme,
  label,
  size = "md",
  className,
  tagline,
}: {
  live: LiveCampaign;
  theme: ThemeTokens;
  label: string;
  tagline?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { tiers, total } = useLiveCampaign(live);
  const currency = theme.currency ?? live.campaign.currency;
  const locale = theme.locale ?? live.campaign.locale ?? "en-EU";
  const featured = tiers[0];
  const amount = featured?.currentAmount ?? total;

  const sizes = {
    sm: "p-4 text-3xl",
    md: "p-5 text-4xl sm:text-5xl",
    lg: "p-6 text-5xl sm:text-6xl",
  } as const;

  return (
    <ThemeScope
      tokens={theme}
      className={cn(
        "group relative overflow-hidden rounded-3xl border jp-animated-border",
        className
      )}
      style={{
        borderColor: "var(--jp-border)",
        // Layered backdrop — theme-colored aurora blobs over a deep card base.
        // Kept soft so each tile is *tinted* by its brand color rather than
        // overpowered by it.
        background:
          "radial-gradient(520px 260px at 0% 0%, oklch(from var(--jp-primary) l c h / 16%), transparent 65%), radial-gradient(520px 260px at 100% 100%, oklch(from var(--jp-secondary) l c h / 14%), transparent 65%), radial-gradient(340px 220px at 85% 0%, oklch(from var(--jp-accent) l c h / 10%), transparent 60%), linear-gradient(180deg, oklch(from var(--jp-card) l c h / 94%), oklch(from var(--jp-card-2) l c h / 96%))",
        boxShadow: "var(--jp-shadow)",
      }}
    >
      {/* Dot-grid pattern for texture — masked so it fades toward the edges */}
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

      {/* Diagonal sheen streak — whisper thin */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(135deg, transparent 42%, oklch(1 0 0 / 3.5%) 52%, transparent 62%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Soft corner glow — just a colored blob, no visible ring outlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-24 z-[1] size-64 rounded-full blur-2xl opacity-40 transition-transform duration-700 group-hover:scale-110"
        style={{
          background:
            "radial-gradient(closest-side, oklch(from var(--jp-accent) l c h / 55%), oklch(from var(--jp-primary) l c h / 25%) 60%, transparent 75%)",
        }}
      />

      {/* Sparkle dots — just a few, extra subtle */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        width="100%"
        height="100%"
      >
        <g fill="oklch(from var(--jp-accent) l c h / 30%)">
          <circle cx="18%" cy="24%" r="1" />
          <circle cx="72%" cy="14%" r="0.9" />
          <circle cx="12%" cy="82%" r="1" />
        </g>
      </svg>

      <div className={cn("relative z-[3] flex flex-col gap-1", sizes[size])}>
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: "var(--jp-muted)" }}
        >
          <span
            aria-hidden
            className="jp-pulse inline-block size-1.5 rounded-full"
            style={{ backgroundColor: "var(--jp-accent)" }}
          />
          {label}
        </span>
        <motion.div
          className="gradient-text font-display font-semibold leading-none drop-shadow-[0_2px_10px_oklch(from_var(--jp-primary)_l_c_h/35%)]"
          style={{ fontFamily: "var(--jp-font-heading)" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <RollingNumber
            value={amount}
            currency={currency}
            locale={locale}
            decimals={amount >= 100_000 ? 0 : 2}
          />
        </motion.div>
        {tagline ? (
          <span
            className="text-xs"
            style={{ color: "var(--jp-muted)" }}
          >
            {tagline}
          </span>
        ) : null}
      </div>

      <ShineSweep />
    </ThemeScope>
  );
}
