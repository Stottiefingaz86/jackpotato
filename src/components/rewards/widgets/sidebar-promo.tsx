"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  Ticket,
  Target,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BRAND = "var(--jp-primary, oklch(0.72 0.22 300))";

export type SidebarPromoKind = "race" | "raffle" | "challenge";

export interface SidebarPromoProps {
  className?: string;
  accent?: string;
  kind?: SidebarPromoKind;
  title?: string;
  amount?: string;
  /** Seconds remaining, drives a mini live countdown. */
  endsInSeconds?: number;
  /** Override for the countdown chip contents. */
  stateLabel?: string;
  /** Render as the currently-selected nav item */
  active?: boolean;
}

function fmt(s: number) {
  if (s >= 86400) {
    const d = Math.floor(s / 86400);
    return `${d}d`;
  }
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

const KIND_ICON: Record<SidebarPromoKind, LucideIcon> = {
  race: Trophy,
  raffle: Ticket,
  challenge: Target,
};

export function SidebarPromo({
  className,
  accent = BRAND,
  kind = "race",
  title,
  amount,
  endsInSeconds = 15 * 3600 + 36 * 60 + 53,
  stateLabel,
  active = false,
}: SidebarPromoProps) {
  const [secs, setSecs] = useState(endsInSeconds);
  useEffect(() => setSecs(endsInSeconds), [endsInSeconds]);
  useEffect(() => {
    const i = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, []);

  const defaults = (() => {
    if (kind === "raffle") return { title: "Weekly Raffle", amount: "$20K" };
    if (kind === "challenge")
      return { title: "Challenges", amount: "$31K" };
    return { title: "Daily Race", amount: "$25K" };
  })();

  const Icon = KIND_ICON[kind];
  const label = stateLabel ?? fmt(secs);

  return (
    <button
      className={cn(
        "group relative flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition",
        active
          ? "bg-[color:var(--jp-card-2,theme(colors.muted))]/60"
          : "hover:bg-[color:var(--jp-card-2,theme(colors.muted))]/40",
        className
      )}
    >
      {/* Icon tile with accent glow */}
      <span
        className="relative grid size-9 shrink-0 place-items-center rounded-md overflow-hidden"
        style={{
          background: `linear-gradient(160deg, oklch(from ${accent} l c h / 22%), oklch(from ${accent} l c h / 6%))`,
          boxShadow: `0 0 16px -4px oklch(from ${accent} l c h / 45%), inset 0 0 0 1px oklch(from ${accent} l c h / 30%)`,
        }}
      >
        <Icon className="size-4" style={{ color: accent }} />
      </span>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div
          className="font-display text-sm font-bold leading-tight tabular-nums truncate"
          style={{ color: "var(--jp-text, currentColor)" }}
        >
          {amount ?? defaults.amount}
        </div>
        <div className="text-[11px] text-muted-foreground truncate leading-tight">
          {title ?? defaults.title}
        </div>
      </div>

      {/* Timer chip */}
      <span
        className="shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums"
        style={{
          color: accent,
          borderColor: `oklch(from ${accent} l c h / 40%)`,
          background: `oklch(from ${accent} l c h / 10%)`,
        }}
      >
        {label}
      </span>
    </button>
  );
}
