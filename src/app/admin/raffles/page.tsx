import Link from "next/link";
import { Ticket, Plus, Sparkles, TrendingUp, Trophy, Timer } from "lucide-react";
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
import { KpiCard } from "@/components/admin/kpi-card";
import { RaffleCard } from "@/components/raffles/raffle-card";
import { getCurrentTenantId } from "@/lib/session";
import {
  getRafflesForTenant,
  getRaffleEntries,
  getRaffleWinners,
  rafflePrizePoolValue,
} from "@/lib/data/store";
import type { RaffleStatus } from "@/lib/types";

const STATUS_VARIANT: Record<
  RaffleStatus,
  { variant: "secondary" | "outline"; label: string }
> = {
  draft: { variant: "outline", label: "Draft" },
  live: { variant: "secondary", label: "Live" },
  drawing: { variant: "secondary", label: "Drawing" },
  completed: { variant: "outline", label: "Completed" },
  archived: { variant: "outline", label: "Archived" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-EU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function RafflesAdminPage() {
  const tenantId = await getCurrentTenantId();
  const raffles = getRafflesForTenant(tenantId);

  const liveCount = raffles.filter((r) => r.status === "live").length;
  const totalTickets = raffles.reduce((s, r) => s + r.totalTickets, 0);
  const totalPlayers = raffles.reduce((s, r) => s + r.totalPlayers, 0);
  const totalPool = raffles.reduce((s, r) => s + rafflePrizePoolValue(r), 0);

  const currency = raffles[0]?.currency ?? "EUR";

  return (
    <>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            <Ticket className="size-7 text-primary" />
            Raffles
          </span>
        }
        description="Ticket-draw promotions. Players earn tickets via gameplay, deposits, or manual grants. TurboPot draws winners weighted by ticket count when the raffle closes."
        actions={
          <Button
            render={
              <Link href="/admin/raffles/new">
                <Plus data-icon="inline-start" />
                New raffle
              </Link>
            }
          />
        }
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <KpiCard
          label="Active raffles"
          value={liveCount}
          hint={`of ${raffles.length} total`}
          format="number"
        />
        <KpiCard
          label="Tickets in play"
          value={totalTickets}
          hint="across all raffles"
          format="number"
        />
        <KpiCard
          label="Unique players"
          value={totalPlayers}
          format="number"
        />
        <KpiCard
          label="Prize pool"
          value={Math.round(totalPool)}
          format="currency"
          currency={currency}
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Live raffles
          </CardTitle>
          <CardDescription>
            Exactly what players see on the marketing site. Countdowns tick in real time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {raffles.length === 0 ? (
            <div className="grid h-32 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">
              No raffles yet. Create one to get started.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {raffles.map((r) => (
                <RaffleCard key={r.id} raffle={r} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            Raffle catalog
          </CardTitle>
          <CardDescription>
            Status, trigger, and pool breakdown at a glance.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Raffle</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead className="text-right">Tickets</TableHead>
                <TableHead className="text-right">Players</TableHead>
                <TableHead>Draw</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {raffles.map((r) => {
                const trigger = r.ticketTrigger;
                const triggerText =
                  trigger.kind === "stake_amount"
                    ? `${trigger.currency}${trigger.perTicket} staked`
                    : trigger.kind === "deposit_amount"
                      ? `${trigger.currency}${trigger.perTicket} deposit`
                      : trigger.kind === "spin_count"
                        ? `${trigger.perTicket} spins`
                        : "Manual";
                const statusMeta = STATUS_VARIANT[r.status];
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{r.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Grand prize: {r.prizes[0]?.label ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {triggerText}
                    </TableCell>
                    <TableCell className="text-right tabular">
                      {r.totalTickets.toLocaleString("en-EU")}
                    </TableCell>
                    <TableCell className="text-right tabular">
                      {r.totalPlayers.toLocaleString("en-EU")}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular">
                      <div className="inline-flex items-center gap-1">
                        <Timer className="size-3" />
                        {formatDate(r.drawAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusMeta.variant} className="capitalize">
                        {statusMeta.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-4 text-primary" />
            Top entrants & recent winners
          </CardTitle>
          <CardDescription>
            Leading players by tickets held in each active raffle, plus the most
            recent completed draws.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {raffles
            .filter((r) => r.status === "live")
            .slice(0, 2)
            .map((r) => {
              const entries = getRaffleEntries(r.id).slice(0, 5);
              if (entries.length === 0) return null;
              return (
                <div key={r.id}>
                  <div className="mb-2 text-sm font-medium">
                    {r.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      Top 5 by ticket count
                    </span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead className="text-right">Tickets</TableHead>
                        <TableHead className="text-right">Odds</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {e.displayName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {e.country ?? "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular">
                            {e.ticketCount.toLocaleString("en-EU")}
                          </TableCell>
                          <TableCell className="text-right tabular text-xs text-muted-foreground">
                            {r.totalTickets > 0
                              ? `${((e.ticketCount / r.totalTickets) * 100).toFixed(2)}%`
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })}

          {raffles.some((r) => r.status === "completed") && (
            <div>
              <div className="mb-2 text-sm font-medium">Recent winners</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Raffle</TableHead>
                    <TableHead>Winner</TableHead>
                    <TableHead>Prize</TableHead>
                    <TableHead>Drawn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {raffles
                    .filter((r) => r.status === "completed")
                    .flatMap((r) =>
                      getRaffleWinners(r.id).map((w) => ({ r, w }))
                    )
                    .slice(0, 10)
                    .map(({ r, w }) => {
                      const prize = r.prizes.find((p) => p.id === w.prizeId);
                      return (
                        <TableRow key={w.id}>
                          <TableCell className="text-sm">{r.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {w.displayName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {w.country ?? "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{prize?.label ?? "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground tabular">
                            {formatDate(w.drawnAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
