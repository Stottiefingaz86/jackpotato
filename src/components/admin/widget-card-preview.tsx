"use client";

import { HeroJackpotBanner } from "@/components/widgets/hero-jackpot-banner";
import { StickyJackpotWidget } from "@/components/widgets/sticky-jackpot-widget";
import { MustDropMeter } from "@/components/widgets/must-drop-meter";
import { RecentWinnerTicker } from "@/components/widgets/recent-winner-ticker";
import { GameCardBadge } from "@/components/widgets/game-card-badge";
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
      return (
        <div className="origin-top-left scale-[0.62] w-[160%]">
          <HeroJackpotBanner
            live={live}
            theme={theme}
            compact
            config={{ ...widget.config, showTiers: false }}
          />
        </div>
      );
    case "must_drop_meter":
      return (
        <div className="p-3">
          <MustDropMeter
            live={live}
            theme={theme}
            config={widget.config}
          />
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
        <div className="p-3">
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
    case "game_badge":
      return (
        <ThemeScope tokens={theme} className="p-3">
          <div className="grid gap-2 grid-cols-2">
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
