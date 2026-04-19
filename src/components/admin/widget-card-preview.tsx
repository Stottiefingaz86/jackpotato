"use client";

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
import { ThemeScope } from "@/components/widgets/theme-scope";
import type { LiveCampaign } from "@/components/widgets/shared";
import type { JackpotWin, ThemeTokens, Widget } from "@/lib/types";

/**
 * A compact preview used in the admin widgets grid. Each widget is rendered
 * at a reasonable mini scale so operators can scan the whole catalog visually.
 */
export function WidgetCardPreview({
  widget,
  theme,
  live,
  winners,
}: {
  widget: Widget;
  theme: ThemeTokens;
  live: LiveCampaign;
  winners: JackpotWin[];
}) {
  switch (widget.type) {
    case "hero":
      // The hero banner is a large surface. We scale the unscaled element to
      // fit the 220px preview slot. `transform: scale` doesn't shrink layout
      // box, so wrap it in a fixed-height overflow-hidden frame and absolutely
      // position the scaled child so the outer Card stays compact.
      return (
        <div className="relative h-[220px] w-full overflow-hidden">
          <div
            className="absolute inset-0 origin-top-left"
            style={{ transform: "scale(0.62)", width: "161.3%" }}
          >
            <HeroJackpotBanner
              live={live}
              theme={theme}
              compact
              config={{ ...widget.config, showTiers: false }}
            />
          </div>
        </div>
      );
    case "tier_cards":
      // Tier strip — shrink slightly so all 3 cards fit inside the compact
      // preview frame without horizontal overflow.
      return (
        <div className="relative h-[220px] w-full overflow-hidden p-3">
          <div
            className="origin-top-left"
            style={{ transform: "scale(0.7)", width: "143%" }}
          >
            <JackpotTiers
              live={live}
              theme={theme}
              config={widget.config}
            />
          </div>
        </div>
      );
    case "must_drop_meter":
      // Meter is shorter; scale lightly so the whole bar + label row fit.
      return (
        <div className="relative h-[220px] w-full overflow-hidden p-3">
          <div
            className="origin-top-left"
            style={{ transform: "scale(0.9)", width: "111.2%" }}
          >
            <MustDropMeter
              live={live}
              theme={theme}
              config={widget.config}
            />
          </div>
        </div>
      );
    case "sticky":
      return (
        <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(600px 260px at 20% 10%, oklch(0.35 0.15 300 / 60%), transparent 70%), linear-gradient(180deg, oklch(0.14 0.03 280), oklch(0.1 0.02 280))",
            }}
          />
          <div className="absolute inset-0 grid place-items-start p-3 text-[11px] text-muted-foreground">
            Host page preview
          </div>
          <StickyJackpotWidget
            live={live}
            theme={theme}
            positioning="absolute"
            config={{ ...widget.config, clickDestination: "#" }}
          />
        </div>
      );
    case "winner_ticker":
      return (
        <div className="relative h-[120px] w-full overflow-hidden p-3 flex items-center">
          <RecentWinnerTicker
            initial={winners}
            theme={theme}
            config={{
              tickerMode: "ticker",
              showFlag: true,
              ...widget.config,
            }}
          />
        </div>
      );
    case "leaderboard":
      return (
        <div className="relative h-[320px] w-full overflow-hidden p-3">
          <LeaderboardWidget
            initial={winners}
            theme={theme}
            config={widget.config}
            className="h-full"
          />
        </div>
      );
    case "winner_spotlight":
      return (
        <div className="relative h-[220px] w-full overflow-hidden p-3">
          <WinnerSpotlightWidget
            initial={winners}
            theme={theme}
            config={widget.config}
          />
        </div>
      );
    case "odometer":
      return (
        <div className="relative h-[120px] w-full overflow-hidden p-3 flex items-center">
          <JackpotOdometer
            live={live}
            theme={theme}
            config={widget.config}
            className="w-full"
          />
        </div>
      );
    case "activity_feed":
      return (
        <div className="relative h-[320px] w-full overflow-hidden p-3">
          <LiveActivityFeed
            initial={winners}
            theme={theme}
            config={{ ...widget.config, maxItems: 5 }}
            className="h-full"
          />
        </div>
      );
    case "game_badge":
      return (
        <ThemeScope tokens={theme} className="relative h-[220px] w-full overflow-hidden p-3">
          <div className="grid gap-2 grid-cols-2 h-full">
            {["Book of Gold", "Neon City"].map((g) => (
              <div
                key={g}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border/60"
                style={{
                  background:
                    "radial-gradient(400px 200px at 0% 100%, oklch(from var(--jp-primary) l c h / 35%), transparent 60%), linear-gradient(135deg, oklch(0.22 0.04 280), oklch(0.14 0.03 280))",
                }}
              >
                <div className="absolute top-2 left-2">
                  <GameCardBadge
                    live={live}
                    theme={theme}
                    config={widget.config}
                  />
                </div>
                <div className="absolute bottom-2 left-2 text-[11px] font-semibold">
                  {g}
                </div>
              </div>
            ))}
          </div>
        </ThemeScope>
      );
  }
}
