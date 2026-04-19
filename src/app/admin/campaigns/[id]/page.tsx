import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { TriggerWinButton } from "@/components/admin/trigger-win-button";
import { HeroJackpotBanner } from "@/components/widgets/hero-jackpot-banner";
import { LiveFeed } from "@/components/admin/live-feed";
import { Pencil, Pause } from "lucide-react";
import {
  getCampaign,
  getTiersForCampaign,
  store,
} from "@/lib/data/store";
import { buildLiveCampaign, buildThemeById } from "@/lib/public";

export default async function CampaignDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = getCampaign(id);
  if (!campaign) notFound();
  const tiers = getTiersForCampaign(id);
  const games = store.eligibleGames.filter((g) => g.campaignId === id);
  const winners = store.winners.filter((w) => w.campaignId === id).slice(0, 10);
  const live = buildLiveCampaign(id)!;
  const theme = buildThemeById("thm_neon_midnight")!;

  return (
    <>
      <PageHeader
        title={campaign.name}
        description={campaign.description}
        actions={
          <>
            <Badge variant="secondary" className="capitalize">
              {campaign.type.replace("_", " ")}
            </Badge>
            <Badge
              variant={campaign.status === "active" ? "secondary" : "outline"}
              className="capitalize"
            >
              {campaign.status}
            </Badge>
            <Button
              variant="outline"
              render={
                <Link href={`/admin/campaigns/${campaign.id}/edit`}>
                  <Pencil data-icon="inline-start" />
                  Edit
                </Link>
              }
            />
            <TriggerWinButton campaignId={campaign.id} />
          </>
        }
      />

      <div className="mb-6">
        <HeroJackpotBanner
          live={live}
          theme={theme}
          config={{
            headline: campaign.name,
            subheadline: campaign.description,
            showTiers: true,
            animationLevel: "full",
            pulse: true,
          }}
        />
      </div>

      <Tabs defaultValue="tiers" className="w-full">
        <TabsList>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="games">Eligible games</TabsTrigger>
          <TabsTrigger value="winners">Recent wins</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers">
          <Card>
            <CardHeader>
              <CardTitle>Tiers</CardTitle>
              <CardDescription>
                Contribution is split by each tier’s percentage. All tiers must
                total 100%.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Split %</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">Seed</TableHead>
                    <TableHead className="text-right">Reset</TableHead>
                    <TableHead className="text-right">Must-drop</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tiers.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full"
                            style={{
                              background: t.color ?? "var(--jp-primary)",
                              boxShadow: `0 0 10px ${t.color ?? "oklch(0.72 0.22 300)"}`,
                            }}
                          />
                          <span className="font-medium">{t.displayLabel}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular">
                        {t.splitPercent}%
                      </TableCell>
                      <TableCell className="text-right tabular font-semibold">
                        {t.currentAmount.toLocaleString(undefined, {
                          style: "currency",
                          currency: campaign.currency,
                        })}
                      </TableCell>
                      <TableCell className="text-right tabular text-muted-foreground">
                        {t.seedAmount.toLocaleString(undefined, {
                          style: "currency",
                          currency: campaign.currency,
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                      <TableCell className="text-right tabular text-muted-foreground">
                        {t.resetAmount.toLocaleString(undefined, {
                          style: "currency",
                          currency: campaign.currency,
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                      <TableCell className="text-right tabular text-muted-foreground">
                        {t.mustDropAmount
                          ? t.mustDropAmount.toLocaleString(undefined, {
                              style: "currency",
                              currency: campaign.currency,
                              maximumFractionDigits: 0,
                            })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <TriggerWinButton
                          campaignId={campaign.id}
                          tierId={t.id}
                          label="Drop"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Core settings</CardTitle>
              </CardHeader>
              <CardContent className="text-sm grid grid-cols-2 gap-3">
                <Cell label="Type" value={campaign.type.replace("_", " ")} />
                <Cell label="Currency" value={campaign.currency} />
                <Cell
                  label="Contribution rate"
                  value={`${(campaign.contributionRate * 100).toFixed(2)}%`}
                />
                <Cell
                  label="Seed amount"
                  value={campaign.seedAmount.toLocaleString(undefined, {
                    style: "currency",
                    currency: campaign.currency,
                  })}
                />
                <Cell
                  label="Reset amount"
                  value={campaign.resetAmount.toLocaleString(undefined, {
                    style: "currency",
                    currency: campaign.currency,
                  })}
                />
                <Cell
                  label="Must drop enabled"
                  value={campaign.rules.mustDropEnabled ? "Yes" : "No"}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Brands & scope</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="flex flex-wrap gap-2">
                  {campaign.brandIds.map((bid) => {
                    const brand = store.brands.find((b) => b.id === bid);
                    return (
                      <Badge
                        key={bid}
                        variant="outline"
                        className="rounded-full"
                        style={{
                          borderColor: brand?.color ?? undefined,
                          color: brand?.color ?? undefined,
                        }}
                      >
                        {brand?.name ?? bid}
                      </Badge>
                    );
                  })}
                </div>
                <p className="mt-4 text-muted-foreground">
                  Starts{" "}
                  {campaign.startsAt
                    ? new Date(campaign.startsAt).toLocaleDateString()
                    : "—"}{" "}
                  · Ends{" "}
                  {campaign.endsAt
                    ? new Date(campaign.endsAt).toLocaleDateString()
                    : "open-ended"}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline">
                    <Pause data-icon="inline-start" />
                    Pause campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="games">
          <Card>
            <CardHeader>
              <CardTitle>Eligible games</CardTitle>
              <CardDescription>
                Bets on these games contribute to this jackpot. Leave empty to
                allow all games for linked brands.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Game</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Group</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {games.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.title}</TableCell>
                      <TableCell>{g.provider}</TableCell>
                      <TableCell>{g.gameGroup}</TableCell>
                    </TableRow>
                  ))}
                  {games.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-8"
                      >
                        All games from linked brands are eligible.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="winners">
          <Card>
            <CardHeader>
              <CardTitle>Recent winners</CardTitle>
              <CardDescription>Last 10 wins for this campaign.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {winners.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="tabular text-muted-foreground">
                        {new Date(w.wonAt).toLocaleString()}
                      </TableCell>
                      <TableCell>{w.displayName} · {w.country}</TableCell>
                      <TableCell>
                        {tiers.find((t) => t.id === w.tierId)?.displayLabel}
                      </TableCell>
                      <TableCell className="capitalize">
                        {w.triggerType.replace("_", " ")}
                      </TableCell>
                      <TableCell className="text-right tabular font-semibold text-amber-300">
                        {w.winAmount.toLocaleString(undefined, {
                          style: "currency",
                          currency: campaign.currency,
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <LiveFeed
            title="Campaign activity"
            description="Live contributions and win events."
          />
        </TabsContent>
      </Tabs>
    </>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/30 p-3">
      <span className="text-xs text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
