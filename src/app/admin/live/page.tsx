import { PageHeader } from "@/components/admin/page-header";
import { LiveStreamStats } from "@/components/admin/live-stream-stats";
import { LiveFeed } from "@/components/admin/live-feed";
import { LiveBalanceCard } from "@/components/admin/live-balance-card";
import { getCurrentTenantId } from "@/lib/session";
import { getCampaignsForTenant } from "@/lib/data/store";
import { buildLiveCampaign, buildThemeById } from "@/lib/public";

export default async function LiveMonitorPage() {
  const tenantId = await getCurrentTenantId();
  const campaigns = getCampaignsForTenant(tenantId);
  const theme = buildThemeById("thm_neon_midnight")!;

  return (
    <>
      <PageHeader
        title="Live monitor"
        description="Real-time event firehose. Every contribution, ingestion, and win is streamed over SSE from the jackpot engine."
      />

      <div className="space-y-6">
        <LiveStreamStats />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((c) => {
            const live = buildLiveCampaign(c.id);
            if (!live) return null;
            return (
              <LiveBalanceCard
                key={c.id}
                live={live}
                href={`/admin/campaigns/${c.id}`}
                theme={theme}
              />
            );
          })}
        </div>

        <LiveFeed
          title="Event firehose"
          description="All jackpot.updated, bet.ingested and jackpot.won events."
        />
      </div>
    </>
  );
}
