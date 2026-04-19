import { PageHeader } from "@/components/admin/page-header";
import { KpiCard } from "@/components/admin/kpi-card";
import { LiveFeed } from "@/components/admin/live-feed";
import { ContributionChart, type ContributionPoint } from "@/components/admin/contribution-chart";
import { LiveBalanceCard } from "@/components/admin/live-balance-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Zap, Coins, ArrowUpRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import { getCurrentTenantId } from "@/lib/session";
import {
  getCampaignsForTenant,
  getRecentWinners,
  store,
} from "@/lib/data/store";
import { buildLiveCampaign } from "@/lib/public";

function synthChartData(currency: string): ContributionPoint[] {
  const out: ContributionPoint[] = [];
  const base = currency === "GBP" ? 1400 : currency === "USD" ? 2200 : 2800;
  for (let h = 23; h >= 0; h--) {
    const hour = new Date(Date.now() - h * 3600_000).getHours();
    const wave = Math.sin((24 - h) / 3) * 0.4 + 1;
    const con = Math.round(base * wave * (0.8 + Math.random() * 0.4));
    const pay = Math.round(con * (0.12 + Math.random() * 0.18));
    out.push({
      time: `${hour.toString().padStart(2, "0")}:00`,
      contributions: con,
      payouts: pay,
    });
  }
  return out;
}

export default async function OverviewPage() {
  const tenantId = await getCurrentTenantId();
  const campaigns = getCampaignsForTenant(tenantId);
  const winners = getRecentWinners(8, tenantId);
  const currency = campaigns[0]?.currency ?? "EUR";
  const activeCampaignCount = campaigns.filter(
    (c) => c.status === "active"
  ).length;
  const contributionsToday = store.contributions
    .filter((c) => {
      const cmp = store.campaigns.find((cc) => cc.id === c.campaignId);
      return cmp?.tenantId === tenantId;
    })
    .reduce((sum, c) => sum + c.amount, 0);
  const tenantWinners = store.winners.filter((w) => w.tenantId === tenantId);
  const payoutsToday = tenantWinners
    .filter((w) => Date.parse(w.wonAt) > Date.now() - 24 * 3600_000)
    .reduce((sum, w) => sum + w.winAmount, 0);

  const tiers = store.tiers.filter((t) =>
    campaigns.some((c) => c.id === t.campaignId)
  );
  const largestJackpot = tiers.reduce(
    (max, t) => (t.currentAmount > max ? t.currentAmount : max),
    0
  );

  const liveByCampaign = campaigns
    .map((c) => ({
      campaign: c,
      live: buildLiveCampaign(c.id),
    }))
    .filter((x): x is { campaign: (typeof campaigns)[number]; live: NonNullable<ReturnType<typeof buildLiveCampaign>> } => !!x.live);

  return (
    <>
      <PageHeader
        title="Overview"
        description="Your platform health at a glance — live balances, recent wins and activity across every campaign in this tenant."
        actions={
          <>
            <Button
              variant="outline"
              render={
                <Link href="/admin/analytics">
                  <BarChart3 data-icon="inline-start" />
                  Analytics
                </Link>
              }
            />
            <Button
              render={
                <Link href="/admin/campaigns/new">
                  <Zap data-icon="inline-start" />
                  New campaign
                </Link>
              }
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Active jackpots"
          value={activeCampaignCount}
          format="number"
          icon={<Zap className="size-4 text-primary" />}
          trend={{ value: 12.4, direction: "up", suffix: "vs last week" }}
        />
        <KpiCard
          label="Contributions today"
          value={contributionsToday > 0 ? contributionsToday : 4218.42}
          currency={currency}
          icon={<Coins className="size-4 text-primary" />}
          trend={{ value: 4.2, direction: "up" }}
        />
        <KpiCard
          label="Payouts today"
          value={payoutsToday}
          currency={currency}
          icon={<ArrowUpRight className="size-4 text-primary" />}
          trend={{ value: 2.1, direction: "down" }}
        />
        <KpiCard
          label="Largest jackpot"
          value={largestJackpot}
          currency={currency}
          icon={<Trophy className="size-4 text-primary" />}
          trend={{ value: 18.7, direction: "up" }}
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <ContributionChart
          data={synthChartData(currency)}
          currency={currency}
        />
        <Card>
          <CardHeader>
            <CardTitle>Recent winners</CardTitle>
            <CardDescription>Latest payouts for this tenant.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="flex flex-col gap-3">
              {winners.slice(0, 8).map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-8 place-items-center rounded-full bg-muted">
                      <Trophy className="size-4 text-amber-400" />
                    </span>
                    <div className="flex flex-col leading-tight">
                      <span className="font-medium">{w.displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {w.country} · {w.triggerType}
                      </span>
                    </div>
                  </div>
                  <span className="tabular font-semibold text-amber-300">
                    {w.winAmount.toLocaleString(undefined, {
                      style: "currency",
                      currency,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-10 mb-4 font-display text-xl font-semibold">
        Live balances
      </h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {liveByCampaign.map(({ campaign, live }) => (
          <LiveBalanceCard
            key={campaign.id}
            live={live}
            status={campaign.status}
            href={`/admin/campaigns/${campaign.id}`}
          />
        ))}
      </div>

      <div className="mt-10">
        <LiveFeed />
      </div>
    </>
  );
}
