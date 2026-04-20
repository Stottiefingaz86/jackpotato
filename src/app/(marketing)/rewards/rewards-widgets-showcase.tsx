"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeScope } from "@/components/widgets/theme-scope";
import { CashRaceBanner } from "@/components/rewards/widgets/cash-race-banner";
import { CashRaceLeaderboard } from "@/components/rewards/widgets/cash-race-leaderboard";
import { DailyBonusClaim } from "@/components/rewards/widgets/daily-bonus-claim";
import { LevelProgress } from "@/components/rewards/widgets/level-progress";
import { RankLadder } from "@/components/rewards/widgets/rank-ladder";
import { ChallengeGrid } from "@/components/rewards/widgets/challenge-grid";
import { RewardsHub } from "@/components/rewards/widgets/rewards-hub";
import { SidebarPromo } from "@/components/rewards/widgets/sidebar-promo";
import { SidenavMock } from "@/components/rewards/widgets/sidenav-mock";
import { THEME_PATTERN_LABELS } from "@/components/effects/theme-pattern";
import type { ThemePattern, ThemeTokens } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface PresetTheme {
  id: string;
  name: string;
  tokens: ThemeTokens;
}

const PATTERN_ORDER: ThemePattern[] = [
  "beams",
  "aurora",
  "grid",
  "dots",
  "diagonal",
  "noise",
  "none",
];

export function RewardsWidgetsShowcase({
  themes,
  defaultThemeId,
  defaultPattern = "beams",
}: {
  themes: PresetTheme[];
  defaultThemeId?: string;
  defaultPattern?: ThemePattern;
}) {
  const [themeId, setThemeId] = useState<string>(
    defaultThemeId ?? themes[0]?.id
  );
  const [pattern, setPattern] = useState<ThemePattern>(defaultPattern);
  const theme = useMemo(
    () => themes.find((t) => t.id === themeId) ?? themes[0],
    [themes, themeId]
  );

  if (!theme) return null;

  return (
    <section
      id="widgets"
      className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-24 scroll-mt-24"
    >
      <div className="flex flex-col gap-3 max-w-3xl mb-10">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Widgets
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
          Drop-in widgets for every surface.
        </h2>
        <p className="text-muted-foreground">
          Cash races, login streaks, XP ladders, challenges, rewards hubs — all
          brand-themed, all realtime. Pick a preset and background to reskin
          every widget below instantly.
        </p>
      </div>

      {/* Preset + pattern picker */}
      <div className="mb-12 rounded-2xl border border-border/60 bg-card/40 p-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] items-start">
          {/* Theme presets */}
          <div>
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Theme preset
              </div>
              <div className="text-[11px] text-muted-foreground hidden sm:block">
                Same presets as the admin theme editor.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {themes.map((t) => {
                const selected = t.id === themeId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setThemeId(t.id)}
                    className={cn(
                      "group relative flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition",
                      selected
                        ? "border-foreground/40 bg-card"
                        : "border-border/60 hover:border-border bg-card/40"
                    )}
                  >
                    <span
                      className="inline-flex h-4 w-8 rounded-full overflow-hidden border border-border/50"
                      aria-hidden
                    >
                      <span
                        className="flex-1"
                        style={{ background: t.tokens.primary }}
                      />
                      <span
                        className="flex-1"
                        style={{ background: t.tokens.secondary }}
                      />
                      <span
                        className="flex-1"
                        style={{ background: t.tokens.accent }}
                      />
                    </span>
                    <span className="font-medium">{t.name}</span>
                    {selected ? (
                      <Check className="size-3.5 text-muted-foreground" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pattern picker */}
          <div className="lg:border-l lg:pl-3 lg:border-border/60">
            <div className="mb-2 px-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Background
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PATTERN_ORDER.map((p) => {
                const selected = p === pattern;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPattern(p)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] transition",
                      selected
                        ? "border-foreground/40 bg-card text-foreground"
                        : "border-border/60 hover:border-border bg-card/40 text-muted-foreground"
                    )}
                  >
                    {THEME_PATTERN_LABELS[p]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Themed region — every descendant widget reads --jp-* from here */}
      <ThemeScope tokens={theme.tokens} className="block space-y-16">
        <WidgetRow label="Cash Race — hero banner">
          <CashRaceBanner pattern={pattern} />
        </WidgetRow>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] items-start">
          <WidgetRow label="Leaderboard" inline>
            <CashRaceLeaderboard
              yourWager={0}
              yourRankThreshold={15_726}
              pattern={pattern}
            />
          </WidgetRow>

          <WidgetRow label="Sidebar promos — shown in a live sidenav" inline>
            <SidenavMock brand={theme.name}>
              <SidebarPromo
                kind="race"
                title="Daily Race"
                amount="$25K"
                endsInSeconds={15 * 3600 + 36 * 60 + 53}
              />
              <SidebarPromo
                kind="race"
                title="Weekly Race"
                amount="$100K"
                stateLabel="4d"
              />
              <SidebarPromo
                kind="race"
                title="Monthly Race"
                amount="$500K"
                stateLabel="10d"
              />
              <SidebarPromo
                kind="raffle"
                title="Weekly Raffle"
                amount="$20K"
                stateLabel="5d"
              />
              <SidebarPromo
                kind="challenge"
                title="Challenges"
                amount="$31K"
                stateLabel="18 active"
              />
            </SidenavMock>
          </WidgetRow>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-start">
          <WidgetRow label="Daily login rewards" inline>
            <DailyBonusClaim pattern={pattern} />
          </WidgetRow>
          <WidgetRow label="Level & XP progress" inline>
            <LevelProgress
              balance={10}
              bonus={0}
              level={7}
              xp={1850}
              xpForNext={2200}
              username="rubberjam"
              pattern={pattern}
            />
          </WidgetRow>
        </div>

        <WidgetRow label="VIP rank ladder">
          <RankLadder wagered={0} pattern={pattern} />
        </WidgetRow>

        <WidgetRow label="Per-game challenges">
          <ChallengeGrid pattern={pattern} />
        </WidgetRow>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] items-start">
          <WidgetRow label="Rewards hub — nav dropdown" inline>
            <RewardsHub ticketCount={12} pattern={pattern} />
          </WidgetRow>

          <div className="pt-6 lg:pt-7">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
              One engine, every surface
            </div>
            <p className="text-muted-foreground mb-4">
              Every widget reads from the same realtime event bus. Countdowns,
              leaderboards and claim states stay in sync across every surface.
            </p>
            <Button
              render={
                <Link href="/widgets-demo">
                  Browse widget gallery
                  <ArrowRight data-icon="inline-end" />
                </Link>
              }
              variant="outline"
              size="lg"
              className="rounded-full w-fit"
            />
          </div>
        </div>
      </ThemeScope>
    </section>
  );
}

function WidgetRow({
  label,
  children,
  inline = false,
}: {
  label: string;
  children: ReactNode;
  inline?: boolean;
}) {
  return (
    <div className={inline ? "" : "max-w-full"}>
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
        {label}
      </div>
      {children}
    </div>
  );
}
