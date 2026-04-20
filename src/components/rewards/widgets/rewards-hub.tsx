"use client";

import {
  Gift,
  Repeat,
  Sparkles,
  Ticket,
  Lock,
  ChevronRight,
} from "lucide-react";
import { RewardShell } from "./reward-shell";
import type { ThemePattern } from "@/lib/types";
import { cn } from "@/lib/utils";

const BRAND = "var(--jp-primary, oklch(0.72 0.22 300))";

export type RewardsHubItemKind =
  | "daily-reload"
  | "rakeback"
  | "daily-bonus"
  | "weekly-bonus"
  | "monthly-bonus"
  | "custom";

export interface RewardsHubItem {
  id: string;
  kind: RewardsHubItemKind;
  label: string;
  amountLabel?: string;
  subtitle?: string;
  state: "claim" | "pending" | "locked" | "value";
}

export interface RewardsHubProps {
  className?: string;
  accent?: string;
  raffleTitle?: string;
  rafflePrize?: string;
  ticketCount?: number;
  items?: RewardsHubItem[];
  onSeeAll?: () => void;
  pattern?: ThemePattern;
}

const DEFAULT_ITEMS: RewardsHubItem[] = [
  {
    id: "1",
    kind: "daily-reload",
    label: "Daily Reload",
    subtitle: "Pending: $0.00",
    amountLabel: "$0.00",
    state: "value",
  },
  {
    id: "2",
    kind: "rakeback",
    label: "Rakeback",
    amountLabel: "Claim",
    subtitle: "$0.00",
    state: "locked",
  },
  {
    id: "3",
    kind: "daily-bonus",
    label: "Daily Bonus",
    amountLabel: "Claim",
    state: "claim",
  },
  {
    id: "4",
    kind: "weekly-bonus",
    label: "Weekly Bonus",
    amountLabel: "Claim",
    state: "claim",
  },
  {
    id: "5",
    kind: "monthly-bonus",
    label: "Monthly Bonus",
    amountLabel: "Claim",
    state: "claim",
  },
];

const ICONS: Record<RewardsHubItemKind, React.ComponentType<{ className?: string }>> = {
  "daily-reload": Sparkles,
  rakeback: Repeat,
  "daily-bonus": Gift,
  "weekly-bonus": Gift,
  "monthly-bonus": Gift,
  custom: Gift,
};

export function RewardsHub({
  className,
  accent = BRAND,
  raffleTitle = "Weekly Raffle",
  rafflePrize = "$20,000",
  ticketCount = 0,
  items = DEFAULT_ITEMS,
  pattern,
}: RewardsHubProps) {
  return (
    <RewardShell
      className={cn("w-full max-w-sm p-0", className)}
      pad={false}
      pattern={pattern}
    >
      <div className="relative flex items-center justify-between gap-3 px-4 py-3 border-b border-[color:var(--rw-border-soft)]">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            {raffleTitle}
          </div>
          <div
            className="font-display text-lg font-semibold tabular-nums"
            style={{ color: accent }}
          >
            {rafflePrize}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Ticket className="size-4" />
          {ticketCount}
        </div>
      </div>

      <ul className="divide-y divide-[color:var(--rw-divider)]">
        {items.map((it) => {
          const Icon = ICONS[it.kind];
          return (
            <li
              key={it.id}
              className="flex items-center justify-between gap-3 px-4 py-2.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="grid size-8 place-items-center rounded-lg bg-[color:var(--rw-surface)] text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <div className="font-medium truncate">{it.label}</div>
                  {it.subtitle ? (
                    <div className="text-[11px] text-muted-foreground truncate">
                      {it.subtitle}
                    </div>
                  ) : null}
                </div>
              </div>
              {it.state === "claim" ? (
                <button
                  className="rounded-md px-3 py-1 text-xs font-semibold text-background"
                  style={{ background: accent }}
                >
                  {it.amountLabel ?? "Claim"}
                </button>
              ) : it.state === "locked" ? (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-[color:var(--rw-surface)] rounded-md px-2 py-1">
                  <Lock className="size-3" />
                  {it.amountLabel ?? "Locked"}
                </span>
              ) : it.state === "pending" ? (
                <span className="text-xs text-muted-foreground rounded-md bg-[color:var(--rw-surface)] px-2 py-1">
                  {it.amountLabel ?? "Pending"}
                </span>
              ) : (
                <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                  {it.amountLabel ?? "—"}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <button className="w-full flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium border-t border-[color:var(--rw-border-soft)] transition hover:bg-[color:var(--rw-surface-muted)]">
        All rewards
        <ChevronRight className="size-4" />
      </button>
    </RewardShell>
  );
}
