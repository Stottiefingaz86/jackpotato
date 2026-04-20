"use client";

import { Check } from "lucide-react";
import { RewardShell } from "./reward-shell";
import type { ThemePattern } from "@/lib/types";
import { cn } from "@/lib/utils";

const BRAND = "var(--jp-primary, oklch(0.72 0.22 300))";

export interface ChallengeItem {
  id: string;
  title: string;
  provider?: string;
  objective: string;
  reward: number;
  currency?: string;
  /** Completion progress 0..1 */
  progress?: number;
  /** True when challenge is done */
  completed?: boolean;
}

export interface ChallengeGridProps {
  className?: string;
  title?: string;
  accent?: string;
  totalActive?: number;
  totalRewards?: number;
  items?: ChallengeItem[];
  pattern?: ThemePattern;
}

const DEFAULT_ITEMS: ChallengeItem[] = [
  {
    id: "1",
    title: "Le Winna",
    provider: "Hacksaw Gaming",
    objective: "First to hit 5,000× with min $1 bet",
    reward: 5000,
    progress: 0.62,
  },
  {
    id: "2",
    title: "Life and Death",
    provider: "Hacksaw Gaming",
    objective: "First to hit 3,000× with min $1 bet",
    reward: 1500,
    progress: 0.18,
  },
  {
    id: "3",
    title: "Book of Dead",
    provider: "Play'n GO",
    objective: "First to hit 2,000× with min $1 bet",
    reward: 1000,
    progress: 0.4,
  },
  {
    id: "4",
    title: "Fish and Cash",
    provider: "Popiplay",
    objective: "First to hit 3,333× with min $2 bet",
    reward: 1000,
    progress: 0.05,
  },
  {
    id: "5",
    title: "Six Six Six",
    provider: "Hacksaw Gaming",
    objective: "First to hit 6,666× with min $1 bet",
    reward: 3000,
    completed: true,
    progress: 1,
  },
];

function money(n: number, c = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: c,
    maximumFractionDigits: 0,
  }).format(n);
}

export function ChallengeGrid({
  className,
  title = "Challenges",
  accent = BRAND,
  totalActive,
  totalRewards,
  items = DEFAULT_ITEMS,
  pattern,
}: ChallengeGridProps) {
  const activeCount = totalActive ?? items.filter((i) => !i.completed).length;
  const rewardsSum =
    totalRewards ?? items.reduce((a, b) => a + (b.completed ? 0 : b.reward), 0);

  return (
    <RewardShell className={cn(className)} pattern={pattern}>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="min-w-0">
          <div className="font-medium truncate">{title}</div>
          <div className="text-[11px] text-muted-foreground">
            First-to-multiplier challenges — live progress per game.
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground tabular-nums">
          <span>
            <span className="text-foreground font-semibold">{activeCount}</span>{" "}
            active
          </span>
          <span className="size-1 rounded-full bg-border" />
          <span>
            <span className="text-foreground font-semibold">
              {money(rewardsSum)}
            </span>{" "}
            in rewards
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((it) => {
          const pct = Math.round((it.progress ?? 0) * 100);
          return (
            <div
              key={it.id}
              className="relative overflow-hidden rounded-xl border border-[color:var(--rw-border-soft)] bg-[color:var(--rw-surface)]"
            >
              {/* Art — monochrome with subtle noise */}
              <div className="relative aspect-[4/5] bg-[color:var(--rw-surface-deep)]">
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(80% 60% at 50% 10%, rgba(255,255,255,0.06), transparent 70%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-2">
                  <div className="font-display text-base sm:text-lg font-semibold leading-tight text-foreground line-clamp-2">
                    {it.title}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {it.provider}
                  </div>
                </div>
                {it.completed ? (
                  <span
                    className="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full text-background"
                    style={{ background: accent }}
                  >
                    <Check className="size-3" />
                  </span>
                ) : null}
              </div>

              <div className="p-2 border-t border-[color:var(--rw-border-soft)]">
                <div className="text-[10px] text-muted-foreground line-clamp-2 min-h-8">
                  {it.objective}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Reward
                  </span>
                  <span className="text-xs font-semibold tabular-nums">
                    {money(it.reward, it.currency ?? "USD")}
                  </span>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-[color:var(--rw-track)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: accent }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </RewardShell>
  );
}
