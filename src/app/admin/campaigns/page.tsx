import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { Trophy, Plus, ArrowRight } from "lucide-react";
import { getCurrentTenantId } from "@/lib/session";
import {
  getCampaignsForTenant,
  campaignTotalAmount,
  store,
} from "@/lib/data/store";

export default async function CampaignsPage() {
  const tenantId = await getCurrentTenantId();
  const campaigns = getCampaignsForTenant(tenantId);

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="All jackpot campaigns for the active tenant. Create new progressive, must-drop, or local pools and tune them in real time."
        actions={
          <Button
            render={
              <Link href="/admin/campaigns/new">
                <Plus data-icon="inline-start" />
                Create campaign
              </Link>
            }
          />
        }
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Brands</TableHead>
                <TableHead className="text-right">Current total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Contribution</TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => {
                const total = campaignTotalAmount(c.id);
                return (
                  <TableRow key={c.id} className="hover:bg-muted/40">
                    <TableCell>
                      <Link
                        href={`/admin/campaigns/${c.id}`}
                        className="flex items-center gap-3 font-medium hover:text-primary"
                      >
                        <span className="grid size-8 place-items-center rounded-full bg-muted">
                          <Trophy className="size-4 text-primary" />
                        </span>
                        <span className="flex flex-col leading-tight">
                          <span>{c.name}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-sm">
                            {c.description}
                          </span>
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {c.type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {c.brandIds
                          .map(
                            (id) =>
                              store.brands.find((b) => b.id === id)?.name ?? id
                          )
                          .join(", ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular font-semibold">
                      {total.toLocaleString(undefined, {
                        style: "currency",
                        currency: c.currency,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={c.status === "active" ? "secondary" : "outline"}
                        className="capitalize"
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular">
                      {(c.contributionRate * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/campaigns/${c.id}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ArrowRight className="size-4" />
                      </Link>
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
