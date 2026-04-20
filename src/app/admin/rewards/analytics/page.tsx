import { PageHeader } from "@/components/admin/page-header";
import { KpiCard } from "@/components/admin/kpi-card";
import { RewardsAnalyticsCharts } from "@/components/admin/rewards-analytics-charts";
import { getCurrentTenantId } from "@/lib/session";
import {
  getCratesForTenant,
  getRafflesForTenant,
} from "@/lib/data/store";
import { Package, Ticket, Trophy, Gift } from "lucide-react";

/** Deterministic PRNG so synthetic chart data is stable between renders. */
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default async function RewardsAnalyticsPage() {
  const tenantId = await getCurrentTenantId();
  const crates = getCratesForTenant(tenantId);
  const raffles = getRafflesForTenant(tenantId);

  const rand = mulberry32(37);

  // 30-day rollup — crate opens + raffle ticket activity.
  const daily = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const opens = Math.round(200 + rand() * 900 + i * 18);
    const tickets = Math.round(400 + rand() * 1600 + i * 26);
    const awarded = Math.round(opens * (80 + rand() * 120));
    return {
      day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      opens,
      tickets,
      awarded,
    };
  });

  const totalOpens = daily.reduce((s, d) => s + d.opens, 0);
  const totalTickets = daily.reduce((s, d) => s + d.tickets, 0);
  const totalAwarded = daily.reduce((s, d) => s + d.awarded, 0);
  const rafflePrizesDrawn = raffles.reduce(
    (s, r) => s + Math.round(5 + rand() * 12),
    0
  );

  // Crate opens by rarity — seeded from the real crate catalogue so the chart
  // reflects which rarities actually exist for this tenant.
  const rarityBuckets = new Map<string, number>();
  crates.forEach((c) => {
    const base =
      c.rarity === "common"
        ? 3200
        : c.rarity === "rare"
          ? 1800
          : c.rarity === "epic"
            ? 900
            : c.rarity === "legendary"
              ? 320
              : 80;
    const jitter = Math.round(base * (0.6 + rand() * 0.8));
    rarityBuckets.set(
      c.rarity,
      (rarityBuckets.get(c.rarity) ?? 0) + jitter
    );
  });
  const byRarity = Array.from(rarityBuckets.entries()).map(([rarity, opens]) => ({
    rarity,
    opens,
  }));

  // Prize value awarded per prize type — aggregated across every live crate.
  const prizeTypeBuckets = new Map<string, number>();
  crates.forEach((c) => {
    c.prizes.forEach((p) => {
      const weightShare = p.weight / 100;
      const opensShare = Math.round(totalOpens * weightShare * 0.04);
      const typeValue =
        p.type === "cash"
          ? opensShare * p.value
          : p.type === "freebet"
            ? opensShare * p.value * 0.7
            : p.type === "freespins"
              ? opensShare * p.value * 0.2
              : p.type === "bonus"
                ? opensShare * 25
                : opensShare * 15;
      prizeTypeBuckets.set(
        p.type,
        (prizeTypeBuckets.get(p.type) ?? 0) + Math.round(typeValue)
      );
    });
  });
  const byPrizeType = Array.from(prizeTypeBuckets.entries()).map(([t, v]) => ({
    type: t.replace("_", " "),
    value: v,
  }));

  // Top crates by opens — seed from real crate metadata so names match the admin.
  const topCrates = crates
    .slice()
    .map((c) => ({
      name: c.name,
      rarity: c.rarity,
      opens: Math.round(200 + rand() * 1600),
    }))
    .sort((a, b) => b.opens - a.opens)
    .slice(0, 5);

  // Raffles — ticket volume & prizes drawn.
  const raffleRows = raffles.slice(0, 6).map((r) => ({
    name: r.name,
    tickets: Math.round(1200 + rand() * 9800),
    prizes: r.prizes.length,
  }));

  return (
    <>
      <PageHeader
        title="Rewards analytics"
        description="Crate opens, raffle activity and prize payouts across every reward campaign. Data is synthetic in this showcase — wire to your warehouse for production."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <KpiCard
          label="Crates opened (30d)"
          value={totalOpens}
          format="number"
          icon={<Package className="size-4" />}
          trend={{ direction: "up", value: 14.2 }}
        />
        <KpiCard
          label="Prize value awarded (30d)"
          value={totalAwarded}
          format="currency"
          icon={<Trophy className="size-4" />}
          trend={{ direction: "up", value: 9.8 }}
        />
        <KpiCard
          label="Raffle tickets earned (30d)"
          value={totalTickets}
          format="number"
          icon={<Ticket className="size-4" />}
          trend={{ direction: "up", value: 6.4 }}
        />
        <KpiCard
          label="Raffle prizes drawn"
          value={rafflePrizesDrawn}
          format="number"
          icon={<Gift className="size-4" />}
        />
      </div>

      <RewardsAnalyticsCharts
        daily={daily}
        byRarity={byRarity}
        byPrizeType={byPrizeType}
        topCrates={topCrates}
        raffleRows={raffleRows}
      />
    </>
  );
}
