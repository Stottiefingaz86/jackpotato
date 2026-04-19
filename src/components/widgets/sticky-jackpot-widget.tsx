"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, ChevronDown, Sparkles } from "lucide-react";
import { RollingNumber } from "@/components/effects/rolling-number";
import { ShineSweep } from "@/components/effects/shine-sweep";
import { ThemeScope } from "@/components/widgets/theme-scope";
import { useLiveCampaign, type LiveCampaign } from "@/components/widgets/shared";
import type { ThemeTokens, WidgetConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface StickyJackpotWidgetProps {
  live: LiveCampaign;
  theme: ThemeTokens;
  config?: WidgetConfig;
  className?: string;
  /** When `absolute`, widget positions itself inside the parent; when `fixed`, sticks to viewport. */
  positioning?: "fixed" | "absolute" | "static";
  /** Start in the collapsed pill state. Defaults to expanded. */
  defaultOpen?: boolean;
}

export function StickyJackpotWidget({
  live,
  theme,
  config,
  className,
  positioning = "fixed",
  defaultOpen = true,
}: StickyJackpotWidgetProps) {
  const { tiers, total, lastWin, pulseKey } = useLiveCampaign(live);
  const [open, setOpen] = useState(defaultOpen);
  const currency = theme.currency ?? live.campaign.currency;
  const locale = theme.locale ?? live.campaign.locale ?? "en-EU";
  const featured = tiers[0];
  const pulse = (config?.pulse ?? true) && theme.motion.pulse;

  const winKey = useMemo(
    () => (lastWin ? `${lastWin.campaignId}-${lastWin.timestamp}` : null),
    [lastWin]
  );

  const positionClass =
    positioning === "fixed"
      ? "fixed bottom-5 right-5 z-[70]"
      : positioning === "absolute"
      ? "absolute bottom-5 right-5"
      : "";

  return (
    <ThemeScope
      tokens={theme}
      as="aside"
      className={cn(
        "pointer-events-auto select-none",
        positionClass,
        className
      )}
      style={{ fontFamily: "var(--jp-font-body)" }}
    >
      <AnimatePresence initial={false} mode="wait">
        {open ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative w-[288px] overflow-hidden rounded-[var(--jp-radius)] border shine"
            style={{
              background:
                "linear-gradient(180deg, oklch(from var(--jp-card) l c h / 96%), oklch(from var(--jp-card-2) l c h / 96%))",
              borderColor: "var(--jp-border)",
              boxShadow: "var(--jp-shadow)",
              backdropFilter: "blur(18px) saturate(140%)",
            }}
          >
            <div
              className="absolute inset-x-0 top-0 h-[2px]"
              style={{ background: "var(--jp-gradient)" }}
            />
            <div className="flex items-start justify-between px-4 pt-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid place-items-center size-7 rounded-full",
                    pulse && "jp-pulse"
                  )}
                  style={{ background: "var(--jp-gradient)" }}
                >
                  <Coins className="size-4" style={{ color: "oklch(0.12 0.02 275)" }} />
                </span>
                <div className="flex flex-col leading-tight">
                  <span
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: "var(--jp-muted)" }}
                  >
                    {live.campaign.name}
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--jp-text)" }}
                  >
                    {featured?.displayLabel ?? "Jackpot"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label="Minimize"
                onClick={() => setOpen(false)}
                className="opacity-60 transition-opacity hover:opacity-100"
                style={{ color: "var(--jp-text)" }}
              >
                <ChevronDown className="size-4" />
              </button>
            </div>

            <motion.div
              key={pulseKey}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.5 }}
              className="px-4 pb-3 pt-1"
            >
              <div
                className="gradient-text font-display font-semibold leading-none max-w-full overflow-hidden"
                style={{
                  fontFamily: "var(--jp-font-heading)",
                  fontSize: "clamp(24px, 8.5vw, 32px)",
                }}
              >
                <RollingNumber
                  value={featured?.currentAmount ?? total}
                  currency={currency}
                  locale={locale}
                  decimals={(featured?.currentAmount ?? total) >= 10_000 ? 0 : 2}
                  compact={(featured?.currentAmount ?? total) >= 1_000_000}
                />
              </div>
              {tiers.length > 1 && (
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {tiers.slice(1, 5).map((t) => (
                    <div
                      key={t.tierId}
                      className="rounded-md border px-2 py-1.5"
                      style={{
                        borderColor: "var(--jp-border)",
                        background: "oklch(from var(--jp-card-2) l c h / 70%)",
                      }}
                    >
                      <span
                        className="block text-[9px] uppercase tracking-widest"
                        style={{ color: "var(--jp-muted)" }}
                      >
                        {t.displayLabel}
                      </span>
                      <span
                        className="tabular text-[13px] font-semibold"
                        style={{ color: "var(--jp-text)" }}
                      >
                        <RollingNumber
                          value={t.currentAmount}
                          currency={currency}
                          locale={locale}
                          decimals={0}
                          compact
                        />
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {config?.clickDestination && (
                <a
                  href={config.clickDestination}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold text-white shine"
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(from var(--jp-primary) l c h) 0%, oklch(from var(--jp-secondary) l c h) 100%)",
                    boxShadow:
                      "0 8px 24px -10px oklch(from var(--jp-primary) l c h / 60%), inset 0 1px 0 oklch(1 0 0 / 25%)",
                    textShadow: "0 1px 2px oklch(0 0 0 / 35%)",
                  }}
                >
                  <Sparkles className="size-3.5" /> Play now
                </a>
              )}
            </motion.div>

            <AnimatePresence>
              {lastWin && (
                <motion.div
                  key={winKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="border-t px-4 py-2 text-[11px] flex items-center justify-between"
                  style={{
                    borderColor: "var(--jp-border)",
                    color: "var(--jp-muted)",
                  }}
                >
                  <span className="truncate">
                    <b style={{ color: "var(--jp-text)" }}>
                      {lastWin.playerDisplay}
                    </b>{" "}
                    won
                  </span>
                  <span style={{ color: "var(--jp-accent)" }} className="font-semibold tabular">
                    <RollingNumber
                      value={lastWin.winAmount}
                      currency={currency}
                      locale={locale}
                      decimals={0}
                      compact
                    />
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <ShineSweep />
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              "group flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shine",
              pulse && "jp-pulse"
            )}
            style={{
              background: "var(--jp-gradient)",
              color: "oklch(0.12 0.02 275)",
              borderColor: "var(--jp-border)",
              boxShadow: "var(--jp-shadow)",
            }}
          >
            <Coins className="size-4" />
            <span className="tabular">
              <RollingNumber
                value={featured?.currentAmount ?? total}
                currency={currency}
                locale={locale}
                decimals={0}
                compact
              />
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </ThemeScope>
  );
}
