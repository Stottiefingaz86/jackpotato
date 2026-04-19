"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RollingNumber } from "@/components/effects/rolling-number";
import { useLiveCampaign, type LiveCampaign } from "@/components/widgets/shared";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function LiveBalanceCard({
  live,
  status,
  href,
  className,
}: {
  live: LiveCampaign;
  status: string;
  href: string;
  className?: string;
}) {
  const { tiers, total, pulseKey } = useLiveCampaign(live);
  const currency = live.campaign.currency;
  const featured = tiers[0];

  return (
    <Link href={href} className={cn("block group", className)}>
      <Card className="relative overflow-hidden group-hover:border-primary/60 transition-colors">
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: "var(--jp-gradient)" }}
        />
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest">
              {live.campaign.type.replace("_", " ")}
            </span>
            <Badge variant={status === "active" ? "secondary" : "outline"}>
              {status}
            </Badge>
          </CardDescription>
          <CardTitle className="font-display">{live.campaign.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            key={pulseKey}
            className="font-display text-3xl font-semibold gradient-text"
          >
            <RollingNumber
              value={total}
              currency={currency}
              decimals={2}
              compact={total >= 1_000_000}
            />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {tiers.slice(0, 4).map((t) => (
              <div
                key={t.tierId}
                className="rounded-md bg-muted/40 px-2 py-1.5 border border-border/60"
              >
                <span className="block text-[9px] uppercase tracking-widest text-muted-foreground">
                  {t.displayLabel}
                </span>
                <span className="tabular text-xs font-semibold">
                  <RollingNumber
                    value={t.currentAmount}
                    currency={currency}
                    decimals={0}
                    compact
                  />
                </span>
              </div>
            ))}
          </div>
          {featured?.mustDropAmount ? (
            <div className="mt-3">
              <div
                className="h-1.5 rounded-full"
                style={{
                  background: "oklch(1 0 0 / 8%)",
                }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (featured.currentAmount / featured.mustDropAmount) * 100)}%`,
                    background: "var(--jp-gradient)",
                  }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground tabular">
                {Math.min(
                  100,
                  (featured.currentAmount / featured.mustDropAmount) * 100
                ).toFixed(1)}
                % toward drop
              </span>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
