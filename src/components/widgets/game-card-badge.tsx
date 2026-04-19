"use client";

import { Crown } from "lucide-react";
import { RollingNumber } from "@/components/effects/rolling-number";
import { ThemeScope } from "@/components/widgets/theme-scope";
import { useLiveCampaign, type LiveCampaign } from "@/components/widgets/shared";
import type { ThemeTokens, WidgetConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface GameCardBadgeProps {
  live: LiveCampaign;
  theme: ThemeTokens;
  config?: WidgetConfig;
  className?: string;
}

export function GameCardBadge({
  live,
  theme,
  config,
  className,
}: GameCardBadgeProps) {
  const { tiers, total } = useLiveCampaign(live);
  const currency = theme.currency ?? live.campaign.currency;
  const locale = theme.locale ?? live.campaign.locale ?? "en-EU";
  const text = config?.badgeText ?? "JACKPOT";
  const compact = config?.compactMode ?? false;
  const amount = tiers[0]?.currentAmount ?? total;

  return (
    <ThemeScope tokens={theme} className={cn("inline-block", className)}>
      <div
        className={cn(
          "relative inline-flex items-center gap-1.5 rounded-full border font-semibold shine",
          compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
        )}
        style={{
          borderColor: "oklch(from var(--jp-accent) l c h / 40%)",
          background: "var(--jp-gradient)",
          color: "oklch(0.12 0.02 275)",
          boxShadow: "0 6px 20px -6px oklch(from var(--jp-primary) l c h / 60%)",
        }}
      >
        <Crown className={compact ? "size-3" : "size-3.5"} />
        <span className="uppercase tracking-widest">{text}</span>
        {config?.showAmount !== false && (
          <span
            className="tabular ml-1 rounded-full px-1.5 py-px"
            style={{
              background: "oklch(0.12 0.02 275 / 24%)",
              color: "oklch(0.12 0.02 275)",
            }}
          >
            <RollingNumber
              value={amount}
              currency={currency}
              locale={locale}
              decimals={0}
              compact
            />
          </span>
        )}
      </div>
    </ThemeScope>
  );
}
