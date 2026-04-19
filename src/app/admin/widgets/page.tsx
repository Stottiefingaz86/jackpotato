import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentTenantId } from "@/lib/session";
import {
  getCampaign,
  getTheme,
  getWidgetsForTenant,
  getRecentWinners,
  store,
} from "@/lib/data/store";
import { buildLiveCampaign, buildThemeForWidget } from "@/lib/public";
import { Plus, Code2, Settings2 } from "lucide-react";
import type { WidgetType } from "@/lib/types";
import { WidgetCardPreview } from "@/components/admin/widget-card-preview";

const WIDGET_LABELS: Record<WidgetType, string> = {
  sticky: "Sticky",
  hero: "Hero banner",
  tier_cards: "Tier cards",
  must_drop_meter: "Must-drop meter",
  winner_ticker: "Winner ticker",
  game_badge: "Game card badge",
  leaderboard: "Leaderboard",
  winner_spotlight: "Winner spotlight",
  odometer: "Odometer",
  activity_feed: "Activity feed",
};

export default async function WidgetsPage() {
  const tenantId = await getCurrentTenantId();
  const widgets = getWidgetsForTenant(tenantId);
  const winners = getRecentWinners(20);

  return (
    <>
      <PageHeader
        title="Widgets"
        description="Embeddable, brandable jackpot displays. Build a widget once, embed it on any site via script tag, React SDK, or public API."
        actions={
          <Button
            render={
              <Link href="/admin/widgets/new">
                <Plus data-icon="inline-start" />
                New widget
              </Link>
            }
          />
        }
      />
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {widgets.map((w) => {
          const brand = store.brands.find((b) => b.id === w.brandId);
          const camp = getCampaign(w.campaignId);
          const theme = getTheme(w.themeId);
          const live = buildLiveCampaign(w.campaignId);
          const resolvedTheme = buildThemeForWidget(w.id);

          return (
            <Card
              key={w.id}
              className="group relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_30px_80px_-40px_rgba(168,85,247,0.4)]"
            >
              <CardHeader className="relative pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-base">{w.name}</CardTitle>
                    <CardDescription className="mt-0.5 flex items-center gap-1.5 truncate text-xs">
                      <span>{WIDGET_LABELS[w.type]}</span>
                      {brand?.name ? (
                        <>
                          <span className="opacity-60">·</span>
                          <span className="truncate">{brand.name}</span>
                        </>
                      ) : null}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={w.status === "live" ? "secondary" : "outline"}
                    className="shrink-0 capitalize tracking-wide"
                  >
                    {w.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-3 pt-0">
                {live && resolvedTheme ? (
                  <div
                    className="relative overflow-hidden rounded-xl border border-border/60 bg-background/40"
                    style={{
                      height:
                        w.type === "winner_ticker"
                          ? 120
                          : w.type === "sticky" || w.type === "leaderboard"
                            ? 320
                            : 220,
                    }}
                  >
                    <WidgetCardPreview
                      widget={w}
                      theme={resolvedTheme}
                      live={live}
                      winners={winners}
                    />
                  </div>
                ) : (
                  <div className="grid h-48 place-items-center rounded-xl border border-dashed text-xs text-muted-foreground">
                    Preview unavailable (missing campaign or theme)
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-70">Campaign:</span>
                    <span className="text-foreground/90 truncate">
                      {camp?.name ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-70">Theme:</span>
                    <span className="inline-flex items-center gap-1.5 text-foreground/90 truncate">
                      <span
                        className="size-2.5 rounded-full shrink-0"
                        style={{ background: theme?.tokens.primary }}
                      />
                      <span className="truncate">{theme?.name ?? "—"}</span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    render={
                      <Link href={`/admin/widgets/${w.id}`}>
                        <Settings2 data-icon="inline-start" />
                        Configure
                      </Link>
                    }
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    render={
                      <Link href={`/admin/widgets/${w.id}#embed`}>
                        <Code2 data-icon="inline-start" />
                        Embed
                      </Link>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
