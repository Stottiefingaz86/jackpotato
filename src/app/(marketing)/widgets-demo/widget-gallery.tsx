"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Sparkles,
  Trophy,
  Zap,
  Crown,
  Star,
  Gauge,
  Radio,
  Check,
  type LucideIcon,
} from "lucide-react";
import { HeroJackpotBanner } from "@/components/widgets/hero-jackpot-banner";
import { StickyJackpotWidget } from "@/components/widgets/sticky-jackpot-widget";
import { MustDropMeter } from "@/components/widgets/must-drop-meter";
import { RecentWinnerTicker } from "@/components/widgets/recent-winner-ticker";
import { GameCardBadge } from "@/components/widgets/game-card-badge";
import { LeaderboardWidget } from "@/components/widgets/leaderboard";
import { WinnerSpotlightWidget } from "@/components/widgets/winner-spotlight";
import { JackpotOdometer } from "@/components/widgets/jackpot-odometer";
import { LiveActivityFeed } from "@/components/widgets/live-activity-feed";
import { JackpotTiers } from "@/components/widgets/jackpot-tiers";
import type { LiveCampaign } from "@/components/widgets/shared";
import type { JackpotWin, ThemeTokens } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type WidgetId =
  | "hero"
  | "tier_cards"
  | "odometer"
  | "must_drop"
  | "sticky"
  | "winner_ticker"
  | "winner_spotlight"
  | "leaderboard"
  | "activity_feed"
  | "game_badge";

interface WidgetDef {
  id: WidgetId;
  name: string;
  tagline: string;
  placement: string;
  icon: LucideIcon;
  category: "Headlines" | "Live data" | "Social proof" | "In-game";
}

const WIDGETS: WidgetDef[] = [
  {
    id: "hero",
    name: "Hero Banner",
    tagline: "Homepage centrepiece",
    placement: "Landing · Lobby",
    icon: Sparkles,
    category: "Headlines",
  },
  {
    id: "tier_cards",
    name: "Tier Cards",
    tagline: "One card per jackpot tier",
    placement: "Promo strips · Campaign pages",
    icon: Crown,
    category: "Headlines",
  },
  {
    id: "odometer",
    name: "Jackpot Odometer",
    tagline: "Slim live total",
    placement: "Headers · Promo strips",
    icon: Gauge,
    category: "Headlines",
  },
  {
    id: "must_drop",
    name: "Must-Drop Meter",
    tagline: "Countdown tension",
    placement: "Lobby · Game page",
    icon: Zap,
    category: "Live data",
  },
  {
    id: "sticky",
    name: "Sticky Widget",
    tagline: "Always-on dock",
    placement: "Every page",
    icon: Trophy,
    category: "Live data",
  },
  {
    id: "winner_ticker",
    name: "Winner Ticker",
    tagline: "Scrolling social proof",
    placement: "Headers · Footers",
    icon: Trophy,
    category: "Social proof",
  },
  {
    id: "winner_spotlight",
    name: "Winner Spotlight",
    tagline: "Single hero winner",
    placement: "Promos · Landing",
    icon: Star,
    category: "Social proof",
  },
  {
    id: "leaderboard",
    name: "Leaderboard",
    tagline: "Ranked top players",
    placement: "Tournaments · Promos",
    icon: Crown,
    category: "Social proof",
  },
  {
    id: "activity_feed",
    name: "Live Activity",
    tagline: "Chat-style stream",
    placement: "Sidebars · Promos",
    icon: Radio,
    category: "Social proof",
  },
  {
    id: "game_badge",
    name: "Game Card Badge",
    tagline: "In-tile overlay",
    placement: "Lobby tiles",
    icon: Sparkles,
    category: "In-game",
  },
];

const CATEGORIES: WidgetDef["category"][] = [
  "Headlines",
  "Live data",
  "Social proof",
  "In-game",
];

export function WidgetGallery({
  themes,
  campaigns,
  liveByCampaign,
  winners,
}: {
  themes: Array<{ id: string; name: string; tokens: ThemeTokens }>;
  campaigns: Array<{ id: string; name: string; currency: string }>;
  liveByCampaign: Record<string, LiveCampaign>;
  winners: JackpotWin[];
}) {
  const [themeId, setThemeId] = useState(themes[0].id);
  const [campaignId, setCampaignId] = useState(campaigns[0].id);
  const [pulse, setPulse] = useState(false);
  const [showTiers, setShowTiers] = useState(true);
  const [anonymize, setAnonymize] = useState(false);

  const selectedTheme = themes.find((t) => t.id === themeId) ?? themes[0];
  const theme = selectedTheme.tokens;
  const live = liveByCampaign[campaignId];

  // Split themes into "yours" (mostly indexed by a light-touch heuristic for
  // the demo — the admin draws this distinction via tenantId, which isn't
  // surfaced here) vs "built-in". The demo page just sorts alphabetically
  // so we keep the whole list under "Presets".
  const presetThemes = useMemo(() => themes, [themes]);

  async function triggerTestWin() {
    const res = await fetch("/api/admin/sandbox/trigger-win", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId }),
    });
    if (res.ok) {
      toast.success("Test win triggered — watch every widget light up.");
    } else {
      toast.error("Could not trigger win.");
    }
  }

  function scrollTo(id: string) {
    const el = document.getElementById(`widget-${id}`);
    if (!el) return;
    // Offset a bit so the section header isn't glued to the top edge.
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <Badge variant="outline" className="rounded-full w-fit">
          Widget playground
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight max-w-3xl">
          {WIDGETS.length} widgets. Infinite brands.{" "}
          <span className="gradient-text">One live engine.</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Scroll through every surface we ship. Pick a theme preset or a
          campaign to re-skin the whole page at once — every widget below is
          driven by the same real-time engine.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr] items-start">
        {/* LEFT: anchor nav + preset-style controls.
         *
         * Every card gets `shrink-0` so nothing can be vertically collapsed
         * by any parent (flex or grid) height inference. `overflow-visible`
         * explicitly overrides the base `<Card>` `overflow-hidden` because
         * inside a sticky / scrollable sidebar that combination can clip
         * content unexpectedly on some browsers.
         *
         * On desktop (lg+) the whole sidebar is one sticky column with its
         * own internal scroll, so the full menu stays reachable no matter
         * where the user is in the widget stack. On mobile/tablet every
         * card just flows naturally above the previews. */}
        <aside
          className={cn(
            "flex flex-col gap-5 min-w-0",
            "lg:sticky lg:top-20 lg:self-start",
            "lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto lg:pr-2",
            "[&::-webkit-scrollbar]:w-1.5",
            "[&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "[&::-webkit-scrollbar-thumb]:bg-border/70",
            "[scrollbar-color:var(--color-border)_transparent]",
            "[scrollbar-width:thin]"
          )}
        >
          <Card className="shrink-0 overflow-visible">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">On this page</CardTitle>
              <CardDescription>
                {WIDGETS.length} surfaces · jump to any section.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0 pb-4">
              {CATEGORIES.map((cat) => {
                const items = WIDGETS.filter((w) => w.category === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat} className="flex flex-col gap-1">
                    <span className="px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {cat}
                    </span>
                    <nav className="flex flex-col">
                      {items.map((w) => {
                        const Icon = w.icon;
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => scrollTo(w.id)}
                            className="group flex items-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 text-left transition hover:border-border hover:bg-card/60"
                          >
                            <span className="grid size-6 shrink-0 place-items-center rounded-md border border-border/70 bg-card text-muted-foreground group-hover:text-foreground">
                              <Icon className="size-3.5" />
                            </span>
                            <span className="truncate text-[13px] font-medium text-foreground/90 group-hover:text-foreground">
                              {w.name}
                            </span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Theme presets — styled to match the admin Presets panel. */}
          <Card className="shrink-0 overflow-visible">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Theme</CardTitle>
              <CardDescription>
                Pick a preset — every widget below re-skins instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0">
              {presetThemes.map((t) => (
                <PresetPill
                  key={t.id}
                  name={t.name}
                  primary={t.tokens.primary}
                  secondary={t.tokens.secondary}
                  accent={t.tokens.accent}
                  selected={t.id === themeId}
                  onSelect={() => setThemeId(t.id)}
                />
              ))}
            </CardContent>
          </Card>

          {/* Campaigns — same preset-pill treatment. */}
          <Card className="shrink-0 overflow-visible">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Campaign</CardTitle>
              <CardDescription>
                Swap the live jackpot feed powering every widget.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0">
              {campaigns.map((c) => {
                const selected = c.id === campaignId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCampaignId(c.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:border-border"
                    )}
                  >
                    <div className="flex min-w-0 flex-col leading-tight">
                      <span className="truncate text-sm font-medium">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {c.currency}
                      </span>
                    </div>
                    {selected && <Check className="size-4 text-primary" />}
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="shrink-0 overflow-visible">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Global toggles</CardTitle>
              <CardDescription>
                Applied across every preview below.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              <Field orientation="horizontal">
                <FieldLabel>Pulse effect</FieldLabel>
                <Switch checked={pulse} onCheckedChange={setPulse} />
              </Field>
              <Field orientation="horizontal">
                <FieldLabel>Show tiers</FieldLabel>
                <Switch checked={showTiers} onCheckedChange={setShowTiers} />
              </Field>
              <Field orientation="horizontal">
                <FieldLabel>Anonymize names</FieldLabel>
                <Switch checked={anonymize} onCheckedChange={setAnonymize} />
              </Field>
              <Button
                onClick={triggerTestWin}
                className="rounded-full mt-1"
                size="sm"
              >
                <Trophy data-icon="inline-start" />
                Trigger test win
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* RIGHT: every widget, stacked into its own section. */}
        <main className="flex flex-col gap-6 min-w-0">
          {WIDGETS.map((w) => (
            <WidgetSection
              key={w.id}
              def={w}
              live={live}
              theme={theme}
              winners={winners}
              pulse={pulse}
              showTiers={showTiers}
              anonymize={anonymize}
            />
          ))}

          <div className="text-xs text-muted-foreground">
            Every widget shares the same realtime store — try opening this page
            in two tabs and triggering a test win.
          </div>
        </main>
      </div>
    </div>
  );
}

function PresetPill({
  name,
  primary,
  secondary,
  accent,
  selected,
  onSelect,
}: {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-full border px-3 py-2 text-left transition",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/40"
          : "border-border/60 hover:border-border"
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex -space-x-1.5">
          <span
            className="size-5 rounded-full border border-background"
            style={{ background: primary }}
          />
          <span
            className="size-5 rounded-full border border-background"
            style={{ background: secondary }}
          />
          <span
            className="size-5 rounded-full border border-background"
            style={{ background: accent }}
          />
        </div>
        <span className="truncate text-sm font-medium">{name}</span>
      </div>
      {selected && <Check className="size-4 text-primary shrink-0" />}
    </button>
  );
}

function WidgetSection({
  def,
  live,
  theme,
  winners,
  pulse,
  showTiers,
  anonymize,
}: {
  def: WidgetDef;
  live: LiveCampaign;
  theme: ThemeTokens;
  winners: JackpotWin[];
  pulse: boolean;
  showTiers: boolean;
  anonymize: boolean;
}) {
  return (
    <section
      id={`widget-${def.id}`}
      className="scroll-mt-24"
      aria-labelledby={`widget-${def.id}-title`}
    >
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
              <def.icon className="size-5" />
            </span>
            <div className="flex flex-col">
              <CardTitle
                id={`widget-${def.id}-title`}
                className="font-display text-2xl"
              >
                {def.name}
              </CardTitle>
              <CardDescription>{def.tagline}</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="rounded-full">
            {def.placement}
          </Badge>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative flex min-h-[280px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[linear-gradient(135deg,oklch(0.16_0.03_280),oklch(0.1_0.02_280))] p-6">
            <WidgetBody
              id={def.id}
              live={live}
              theme={theme}
              winners={winners}
              pulse={pulse}
              showTiers={showTiers}
              anonymize={anonymize}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function WidgetBody({
  id,
  live,
  theme,
  winners,
  pulse,
  showTiers,
  anonymize,
}: {
  id: WidgetId;
  live: LiveCampaign;
  theme: ThemeTokens;
  winners: JackpotWin[];
  pulse: boolean;
  showTiers: boolean;
  anonymize: boolean;
}) {
  switch (id) {
    case "hero":
      return (
        <div className="w-full max-w-4xl">
          <HeroJackpotBanner
            live={live}
            theme={theme}
            config={{
              headline: "Every spin. A chance to win.",
              subheadline: "Four tiers. One unstoppable progressive.",
              ctaLabel: "Play now",
              ctaUrl: "#",
              showTiers,
              pulse,
              animationLevel: "full",
            }}
          />
        </div>
      );
    case "tier_cards":
      return (
        <div className="w-full max-w-4xl">
          <JackpotTiers
            live={live}
            theme={theme}
            config={{ pulse }}
          />
        </div>
      );
    case "odometer":
      return (
        <div className="w-full max-w-3xl">
          <JackpotOdometer
            live={live}
            theme={theme}
            config={{ pulse, headline: `${live.campaign.name} · live pool` }}
          />
        </div>
      );
    case "must_drop":
      return (
        <div className="w-full max-w-xl">
          <MustDropMeter
            live={live}
            theme={theme}
            config={{ countdown: true, showTiers, pulse }}
          />
        </div>
      );
    case "sticky":
      return (
        <div className="relative h-[300px] w-full">
          <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
            (preview surface — sticky anchors to the corner)
          </div>
          <StickyJackpotWidget
            live={live}
            theme={theme}
            positioning="absolute"
            config={{ pulse, clickDestination: "#" }}
          />
        </div>
      );
    case "winner_ticker":
      // Show every variant of the ticker so operators can compare at a
      // glance — one per row with a small label.
      return (
        <div className="flex w-full max-w-3xl flex-col gap-6">
          <VariantBlock label="Ticker · marquee">
            <RecentWinnerTicker
              initial={winners}
              theme={theme}
              config={{
                tickerMode: "ticker",
                anonymize,
                showFlag: true,
                maxItems: 20,
              }}
            />
          </VariantBlock>
          <VariantBlock label="Bar · flat strip">
            <RecentWinnerTicker
              initial={winners}
              theme={theme}
              config={{
                tickerMode: "bar",
                anonymize,
                showFlag: true,
                maxItems: 20,
              }}
            />
          </VariantBlock>
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,260px)]">
            <VariantBlock label="Stack · vertical list">
              <RecentWinnerTicker
                initial={winners}
                theme={theme}
                config={{
                  tickerMode: "stack",
                  anonymize,
                  showFlag: true,
                  maxItems: 6,
                  headline: "Recent winners",
                }}
              />
            </VariantBlock>
            <VariantBlock label="Toast · rotating">
              <div className="grid place-items-center h-full">
                <RecentWinnerTicker
                  initial={winners}
                  theme={theme}
                  config={{
                    tickerMode: "toast",
                    anonymize,
                    showFlag: true,
                    maxItems: 8,
                    autoRotateSpeed: 3,
                  }}
                />
              </div>
            </VariantBlock>
          </div>
        </div>
      );
    case "winner_spotlight":
      return (
        <div className="w-full max-w-2xl">
          <WinnerSpotlightWidget
            initial={winners}
            theme={theme}
            config={{
              headline: "Latest big winner",
              ctaLabel: "You could be next",
              clickDestination: "#",
              showCountry: true,
              anonymize,
            }}
          />
        </div>
      );
    case "leaderboard":
      return (
        <div className="w-full max-w-md">
          <LeaderboardWidget
            initial={winners}
            theme={theme}
            config={{
              headline: "Top winners",
              leaderboardPeriod: "7d",
              leaderboardMetric: "total_won",
              maxItems: 8,
              showCountry: true,
              anonymize,
            }}
          />
        </div>
      );
    case "activity_feed":
      return (
        <div className="w-full max-w-sm">
          <LiveActivityFeed
            initial={winners}
            theme={theme}
            config={{
              headline: "Live activity",
              showAmount: true,
              maxItems: 8,
              anonymize,
            }}
          />
        </div>
      );
    case "game_badge":
      return (
        <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["Book of Gold", "Sweet Bonanza", "Neon City"].map((g) => (
            <div
              key={g}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border"
              style={{
                background:
                  "radial-gradient(600px 240px at 0% 100%, oklch(0.72 0.22 300 / 30%), transparent 60%), radial-gradient(400px 200px at 100% 0%, oklch(0.84 0.19 85 / 20%), transparent 60%), linear-gradient(135deg, oklch(0.25 0.04 280), oklch(0.18 0.03 280))",
              }}
            >
              <div className="absolute top-3 left-3">
                <GameCardBadge live={live} theme={theme} />
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <span className="font-display text-lg font-semibold">{g}</span>
                <span className="text-xs text-muted-foreground">Slots</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
                🎰
              </div>
            </div>
          ))}
        </div>
      );
  }
}

function VariantBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}
