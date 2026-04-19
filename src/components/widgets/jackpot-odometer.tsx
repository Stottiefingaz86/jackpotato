"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";
import { Flame } from "lucide-react";
import { RollingNumber } from "@/components/effects/rolling-number";
import { ShineSweep } from "@/components/effects/shine-sweep";
import { ThemeScope } from "@/components/widgets/theme-scope";
import { useLiveCampaign, type LiveCampaign } from "@/components/widgets/shared";
import type { ThemeTokens, WidgetConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface JackpotOdometerProps {
  live: LiveCampaign;
  theme: ThemeTokens;
  config?: WidgetConfig;
  className?: string;
}

/**
 * Ultra-wide minimal odometer. No tiers, no CTA, no marketing copy — just a
 * prominent live total. Drops cleanly into game footers, promo strips,
 * checkout screens, and anywhere a full hero banner would be too loud.
 */
export function JackpotOdometer({
  live,
  theme,
  config,
  className,
}: JackpotOdometerProps) {
  const { total } = useLiveCampaign(live);

  const currency = theme.currency ?? live.campaign.currency;
  const locale = theme.locale ?? live.campaign.locale ?? "en-EU";

  const pulse = useAnimationControls();
  useEffect(() => {
    if (config?.pulse === false) return;
    pulse.start({
      scale: [1, 1.012, 1],
      transition: { duration: 0.6, ease: "easeOut" },
    });
  }, [total, pulse, config?.pulse]);

  return (
    <ThemeScope
      tokens={theme}
      className={cn(
        "relative flex items-center gap-4 overflow-hidden rounded-full border px-6 py-3 sm:px-8 sm:py-4",
        className
      )}
      style={{
        borderColor: "var(--jp-border)",
        background:
          "linear-gradient(90deg, oklch(from var(--jp-card) l c h / 96%), oklch(from var(--jp-card-2) l c h / 96%))",
        boxShadow: "var(--jp-shadow)",
        fontFamily: "var(--jp-font-body)",
      }}
    >
      <span
        className="grid size-8 shrink-0 place-items-center rounded-full"
        style={{ background: "var(--jp-gradient)" }}
      >
        <Flame className="size-4" style={{ color: "oklch(0.12 0.02 275)" }} />
      </span>

      <div className="flex flex-col leading-none min-w-0">
        <span
          className="text-[10px] uppercase tracking-[0.24em]"
          style={{ color: "var(--jp-muted)" }}
        >
          {config?.headline ?? `${live.campaign.name} · live pool`}
        </span>
        <motion.div animate={pulse} className="mt-1">
          <span
            className="gradient-text tabular font-display font-semibold"
            style={{
              fontFamily: "var(--jp-font-heading)",
              fontSize: "clamp(22px, 4vw, 40px)",
              lineHeight: 1,
            }}
          >
            <RollingNumber
              value={total}
              currency={currency}
              locale={locale}
              decimals={total >= 10_000 ? 0 : 2}
            />
          </span>
        </motion.div>
      </div>

      <div
        className="ml-auto hidden shrink-0 items-center gap-1.5 sm:inline-flex"
        style={{ color: "var(--jp-muted)" }}
      >
        <span
          className="inline-block size-1.5 rounded-full animate-pulse"
          style={{ background: "var(--jp-accent)" }}
        />
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em]">
          Live
        </span>
      </div>

      <ShineSweep />
    </ThemeScope>
  );
}
