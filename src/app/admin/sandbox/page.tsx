import { PageHeader } from "@/components/admin/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SimControls } from "@/components/admin/sim-controls";
import { LiveFeed } from "@/components/admin/live-feed";
import { LiveBalanceCard } from "@/components/admin/live-balance-card";
import { TriggerWinButton } from "@/components/admin/trigger-win-button";
import { getCurrentTenantId } from "@/lib/session";
import {
  getCampaignsForTenant,
  getTiersForCampaign,
  store,
} from "@/lib/data/store";
import { buildLiveCampaign, buildThemeById } from "@/lib/public";
import { Zap, FlaskConical } from "lucide-react";

export default async function SandboxPage() {
  const tenantId = await getCurrentTenantId();
  const campaigns = getCampaignsForTenant(tenantId);
  const theme = buildThemeById("thm_neon_midnight")!;

  return (
    <>
      <PageHeader
        title="Sandbox"
        description="Drive synthetic bet events through the engine, tune speed, and trigger targeted wins. Perfect for showing operators how widgets react in real time."
        actions={
          <FlaskConical className="size-5 text-primary" />
        }
      />

      <Card className="mb-6 border-primary/40 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            Simulator
          </CardTitle>
          <CardDescription>
            Generates weighted bet events across active campaigns. Events emit
            on the same bus used by production ingestion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimControls
            running={store.simulatorRunning}
            speedMs={store.simulatorIntervalMs}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Trigger targeted wins</CardTitle>
              <CardDescription>
                Fire a manual jackpot win for any tier. The engine emits a
                real <code className="text-xs">jackpot.won</code> event and
                resets the tier.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {campaigns.map((c) => {
                const tiers = getTiersForCampaign(c.id);
                return (
                  <div key={c.id} className="space-y-2">
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="flex flex-wrap gap-2">
                      {tiers.map((t) => (
                        <TriggerWinButton
                          key={t.id}
                          campaignId={c.id}
                          tierId={t.id}
                          label={`Drop ${t.displayLabel}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            {campaigns.slice(0, 4).map((c) => {
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
        </div>
        <LiveFeed
          title="Live event stream"
          description="All contributions, bets and wins the engine sees in real time."
        />
      </div>
    </>
  );
}
