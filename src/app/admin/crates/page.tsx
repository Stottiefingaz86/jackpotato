import Link from "next/link";
import {
  Package,
  Sparkles,
  Plus,
  Coins,
  Gift,
  Dice5,
  Zap,
  TrendingUp,
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CrateCard } from "@/components/crates/crate-card";
import { KpiCard } from "@/components/admin/kpi-card";
import { getCurrentTenantId } from "@/lib/session";
import {
  getCratesForTenant,
  crateExpectedValue,
  store,
} from "@/lib/data/store";
import type { CratePrizeType, CrateRarity } from "@/lib/types";

const RARITY_BADGE: Record<CrateRarity, string> = {
  common: "bg-[#c97b3f22] text-[#f4a261] border-[#c97b3f55]",
  rare: "bg-[#c0c7d622] text-[#d8dee9] border-[#c0c7d655]",
  epic: "bg-[#f6c04222] text-[#f6c042] border-[#f6c04255]",
  legendary: "bg-[#a855f722] text-[#d946ef] border-[#a855f755]",
  mythic: "bg-[#22d3ee22] text-[#22d3ee] border-[#22d3ee55]",
};

const PRIZE_ICON_KEY: Record<
  CratePrizeType,
  React.ComponentType<{ className?: string }>
> = {
  cash: Coins,
  freespins: Sparkles,
  freebet: Dice5,
  bonus: Gift,
  multiplier: Zap,
};

export default async function CratesAdminPage() {
  const tenantId = await getCurrentTenantId();
  const crates = getCratesForTenant(tenantId);

  const liveCount = crates.filter((c) => c.status === "live").length;
  const unlocks = store.crateUnlocks.filter((u) =>
    crates.some((c) => c.id === u.crateId)
  );
  const openedCount = unlocks.filter((u) => u.openedAt !== null).length;
  const totalPrizeCount = crates.reduce((s, c) => s + c.prizes.length, 0);
  const avgEv =
    crates.length > 0
      ? crates.reduce((s, c) => s + crateExpectedValue(c), 0) / crates.length
      : 0;

  const evFmt = new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  });

  return (
    <>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            <Package className="size-7 text-primary" />
            Crate Drops
          </span>
        }
        description="Configure loot crates that players unlock during gameplay. Each crate has a weighted prize pool, rarity tier, and unlock trigger — tune them live without redeploying games."
        actions={
          <Button
            render={
              <Link href="/admin/crates/new">
                <Plus data-icon="inline-start" />
                New crate
              </Link>
            }
          />
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <KpiCard
          label="Active crates"
          value={liveCount}
          hint={`of ${crates.length} configured`}
          format="number"
        />
        <KpiCard
          label="Crates unlocked"
          value={unlocks.length}
          hint="last 30 days"
          format="number"
        />
        <KpiCard
          label="Crates opened"
          value={openedCount}
          hint={`${
            unlocks.length > 0
              ? Math.round((openedCount / unlocks.length) * 100)
              : 0
          }% open rate`}
          format="number"
        />
        <KpiCard
          label="Avg. expected value"
          value={Math.round(avgEv * 100) / 100}
          format="currency"
          currency="EUR"
        />
      </div>

      {/* Live preview rail */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Live previews
          </CardTitle>
          <CardDescription>
            Open any crate to feel exactly what the player experiences. Prize weights
            drive the actual outcome.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {crates.map((c) => (
              <CrateCard key={c.id} crate={c} compact />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            Crate catalog
          </CardTitle>
          <CardDescription>
            Rarity, trigger, and prize breakdown at a glance.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Crate</TableHead>
                <TableHead>Rarity</TableHead>
                <TableHead>Animation</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Prizes</TableHead>
                <TableHead className="text-right">Daily cap</TableHead>
                <TableHead className="text-right">EV</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crates.map((c) => {
                const ev = crateExpectedValue(c);
                const trigger = c.unlockTrigger;
                const triggerText =
                  trigger.kind === "stake_amount"
                    ? `Stake ${trigger.currency} ${trigger.threshold}+`
                    : trigger.kind === "spin_count"
                      ? `${trigger.count} spins`
                      : trigger.kind === "win_streak"
                        ? `${trigger.streak}-win streak`
                        : trigger.kind === "daily_login"
                          ? "Daily login"
                          : "Manual · VIP";
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-xs">
                          {c.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${RARITY_BADGE[c.rarity]}`}
                      >
                        {c.rarity}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs capitalize text-muted-foreground">
                      {c.artVariant ?? "chest"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {triggerText}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {c.prizes.slice(0, 5).map((p) => {
                          const Icon = PRIZE_ICON_KEY[p.type];
                          return (
                            <span
                              key={p.id}
                              title={`${p.label} · ${p.weight}%`}
                              className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/60 px-1.5 py-0.5 text-[11px]"
                            >
                              <Icon className="size-3 text-primary" />
                              {p.label}
                            </span>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular">
                      {c.maxOpensPerDay ?? "∞"}
                    </TableCell>
                    <TableCell className="text-right tabular">
                      {evFmt.format(ev)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={c.status === "live" ? "secondary" : "outline"}
                        className="capitalize"
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent unlocks */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent unlocks</CardTitle>
          <CardDescription>
            Live feed of the last crates unlocked and what was inside.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Crate</TableHead>
                <TableHead>Prize won</TableHead>
                <TableHead>Unlocked</TableHead>
                <TableHead>Opened</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unlocks.slice(0, 10).map((u) => {
                const crate = crates.find((c) => c.id === u.crateId);
                const prize = crate?.prizes.find(
                  (p) => p.id === u.awardedPrizeId
                );
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{u.displayName}</span>
                        <span className="text-xs text-muted-foreground">
                          {u.country ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${RARITY_BADGE[crate?.rarity ?? "common"]}`}
                        >
                          {crate?.rarity}
                        </span>
                        <span>{crate?.name ?? "—"}</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      {prize ? (
                        <span className="font-medium">{prize.label}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Unopened
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular">
                      {new Date(u.unlockedAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular">
                      {u.openedAt
                        ? new Date(u.openedAt).toLocaleTimeString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
