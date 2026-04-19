import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentTenantId } from "@/lib/session";
import { getRecentWinners, store } from "@/lib/data/store";
import { formatMoney } from "@/lib/theme";
import { Trophy } from "lucide-react";

export default async function WinnersPage() {
  const tenantId = await getCurrentTenantId();
  const winners = getRecentWinners(200, tenantId);
  const totalPaid = winners.reduce((s, w) => s + w.winAmount, 0);
  const largestEver = winners.reduce(
    (m, w) => (w.winAmount > m ? w.winAmount : m),
    0
  );
  const currency = winners[0]?.triggerType ? "USD" : "USD";

  return (
    <>
      <PageHeader
        title="Winners"
        description="Every jackpot drop for this tenant, with player display name, tier, trigger reason and amount."
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total wins"
          value={winners.length.toString()}
          icon={<Trophy className="size-4" />}
        />
        <StatCard
          label="Total paid out"
          value={formatMoney(totalPaid, currency)}
          tone="amber"
        />
        <StatCard
          label="Largest drop"
          value={formatMoney(largestEver, currency)}
          tone="primary"
        />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.map((w) => {
                const c = store.campaigns.find((x) => x.id === w.campaignId);
                const tier = store.tiers.find((t) => t.id === w.tierId);
                return (
                  <TableRow key={w.id}>
                    <TableCell className="tabular text-muted-foreground">
                      {new Date(w.wonAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-amber-400/80 to-rose-500/80 text-xs font-bold">
                          {w.displayName.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="leading-tight">
                          <div className="font-medium">{w.displayName}</div>
                          <div className="text-xs text-muted-foreground">
                            {w.country ?? "—"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {c ? (
                        <Link
                          className="hover:text-primary"
                          href={`/admin/campaigns/${c.id}`}
                        >
                          {c.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="size-2 rounded-full"
                          style={{
                            background: tier?.color ?? "var(--jp-primary)",
                          }}
                        />
                        {tier?.displayLabel ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {w.triggerType.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular font-semibold text-amber-300">
                      {formatMoney(w.winAmount, c?.currency ?? "USD")}
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

function StatCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: "default" | "amber" | "primary";
}) {
  const toneColor =
    tone === "amber"
      ? "text-amber-300"
      : tone === "primary"
        ? "text-primary"
        : "text-foreground";
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest">
            {label}
          </div>
          <div className={`mt-1 text-2xl font-bold tabular ${toneColor}`}>
            {value}
          </div>
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </CardContent>
    </Card>
  );
}
