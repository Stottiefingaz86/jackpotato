import { PageHeader } from "@/components/admin/page-header";
import {
  AnalyticsCharts,
  type AnalyticsData,
} from "@/components/admin/analytics-charts";
import { KpiCard } from "@/components/admin/kpi-card";
import { getCurrentTenantId } from "@/lib/session";
import {
  getCampaignsForTenant,
  getBrandsForTenant,
  getRecentWinners,
} from "@/lib/data/store";
import { Coins, Gauge, Trophy, Users } from "lucide-react";

/** Deterministic PRNG so the chart data is stable between renders. */
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default async function AnalyticsPage() {
  const tenantId = await getCurrentTenantId();
  const campaigns = getCampaignsForTenant(tenantId);
  const brands = getBrandsForTenant(tenantId);
  const winners = getRecentWinners(500, tenantId);

  const rand = mulberry32(17);
  const daily = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const contributions = 8000 + rand() * 30000 + i * 400;
    const payouts = contributions * (0.2 + rand() * 0.6);
    const bets = 2000 + rand() * 2400 + i * 40;
    return {
      day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      contributions: Math.round(contributions),
      payouts: Math.round(payouts),
      bets: Math.round(bets),
    };
  });

  const totalContrib = daily.reduce((s, d) => s + d.contributions, 0);
  const totalPayouts = daily.reduce((s, d) => s + d.payouts, 0);
  const totalBets = daily.reduce((s, d) => s + d.bets, 0);

  const byBrand = brands.map((b) => ({
    brand: b.name,
    contributions: Math.round(totalContrib * (0.1 + rand() * 0.4)),
  }));

  const typeMap = new Map<string, number>();
  campaigns.forEach((c) => {
    const current = typeMap.get(c.type) ?? 0;
    typeMap.set(c.type, current + Math.round(5000 + rand() * 40000));
  });
  const byType = Array.from(typeMap.entries()).map(([t, v]) => ({
    type: t.replace("_", " "),
    value: v,
  }));

  const data: AnalyticsData = {
    daily,
    byBrand,
    byType,
    funnel: [],
  };

  return (
    <>
      <PageHeader
        title="Jackpots analytics"
        description="Contribution and payout trends across every jackpot campaign. Data is synthetic in this showcase — wire to your warehouse for production."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <KpiCard
          label="Contributions (30d)"
          value={totalContrib}
          format="currency"
          icon={<Coins className="size-4" />}
          trend={{ direction: "up", value: 12.4 }}
        />
        <KpiCard
          label="Payouts (30d)"
          value={totalPayouts}
          format="currency"
          icon={<Trophy className="size-4" />}
          trend={{ direction: "up", value: 8.1 }}
        />
        <KpiCard
          label="Bets (30d)"
          value={totalBets}
          format="number"
          icon={<Gauge className="size-4" />}
          trend={{ direction: "up", value: 5.6 }}
        />
        <KpiCard
          label="Unique winners"
          value={winners.length}
          format="number"
          icon={<Users className="size-4" />}
        />
      </div>

      <AnalyticsCharts data={data} />
    </>
  );
}
