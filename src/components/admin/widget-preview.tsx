"use client";

import { StickyJackpotWidget } from "@/components/widgets/sticky-jackpot-widget";
import { HeroJackpotBanner } from "@/components/widgets/hero-jackpot-banner";
import { MustDropMeter } from "@/components/widgets/must-drop-meter";
import { RecentWinnerTicker } from "@/components/widgets/recent-winner-ticker";
import { GameCardBadge } from "@/components/widgets/game-card-badge";
import { ThemeScope } from "@/components/widgets/theme-scope";
import type { LiveCampaign } from "@/components/widgets/shared";
import type { ThemeTokens, Widget, JackpotWin } from "@/lib/types";

export function WidgetPreview({
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
  const content = (() => {
    switch (widget.type) {
      case "sticky":
        return (
          <div className="relative min-h-[340px] rounded-xl bg-gradient-to-br from-black to-zinc-950 p-4">
            <div className="absolute bottom-4 right-4">
              <StickyJackpotWidget
                live={live}
                theme={theme}
                config={widget.config}
              />
            </div>
            <div className="pointer-events-none text-xs text-muted-foreground">
              Sticky widget anchors to the bottom-right of the host page.
            </div>
          </div>
        );
      case "hero":
        return (
          <HeroJackpotBanner
            live={live}
            theme={theme}
            config={widget.config}
          />
        );
      case "must_drop_meter":
        return (
          <MustDropMeter
            live={live}
            theme={theme}
            config={widget.config}
          />
        );
      case "winner_ticker":
        return (
          <RecentWinnerTicker
            initial={winners}
            theme={theme}
            config={widget.config}
          />
        );
      case "game_badge":
        return (
          <div className="grid gap-4 sm:grid-cols-3">
            {["Book of Gold", "Sweet Bonanza", "Neon City"].map((t, i) => (
              <div
                key={t}
                className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gradient-to-br from-fuchsia-900/40 via-zinc-900 to-zinc-950 p-4"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-sm font-semibold">
                  {t}
                </div>
                <div className="absolute top-3 left-3">
                  <GameCardBadge
                    live={live}
                    theme={theme}
                    config={widget.config}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">
                  {["🎰", "🎰", "🎰"][i]}
                </div>
              </div>
            ))}
          </div>
        );
    }
  })();

  return <ThemeScope tokens={theme}>{content}</ThemeScope>;
}
