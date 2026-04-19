import { PageHeader } from "@/components/admin/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getCurrentTenantId } from "@/lib/session";
import { getTenant, store } from "@/lib/data/store";
import { ExternalLink, Save } from "lucide-react";

export default async function SettingsPage() {
  const tenantId = await getCurrentTenantId();
  const tenant = getTenant(tenantId);
  const members = store.memberships.filter((m) => m.tenantId === tenantId);
  const admins = members
    .map((m) => ({
      m,
      u: store.users.find((u) => u.id === m.userId)!,
    }))
    .filter((x) => x.u);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Tenant identity, payout guards, compliance windows, and user access."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tenant</CardTitle>
            <CardDescription>
              Identity for this workspace. Changes sync across all brands.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input defaultValue={tenant?.name} />
            </div>
            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input defaultValue={tenant?.slug} />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Input defaultValue={tenant?.type} readOnly />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Input defaultValue={tenant?.status} readOnly />
            </div>
            <div className="col-span-2 flex justify-end">
              <Button size="sm">
                <Save data-icon="inline-start" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout safeguards</CardTitle>
            <CardDescription>
              Human review thresholds and compliance hooks before wins are
              processed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row label="Require approval above $100k" on />
            <Row label="Auto-freeze suspicious contribution rates" on />
            <Row label="KYC check at claim" on />
            <Row label="Responsible gaming guardrails" on={false} />
            <div className="grid gap-2">
              <Label>Daily payout ceiling</Label>
              <Input defaultValue="2,500,000" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Realtime & webhooks</CardTitle>
            <CardDescription>
              Route events to external systems for analytics, notifications, or
              reconciliation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row label="Publish jackpot.updated via webhook" on />
            <Row label="Publish jackpot.won via webhook" on />
            <Row label="Emit metrics to Prometheus" on={false} />
            <div className="grid gap-2">
              <Label>Webhook endpoint</Label>
              <Input defaultValue="https://hooks.ops.example.com/jackpots" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team & access</CardTitle>
            <CardDescription>People in this tenant.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {admins.map(({ u, m }) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3"
              >
                <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-primary/60 to-secondary/60 font-bold text-sm">
                  {u.name
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div className="leading-tight flex-1 min-w-0">
                  <div className="truncate font-medium">{u.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {u.email}
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {m.role.replace("_", " ")}
                </Badge>
              </div>
            ))}
            <Button size="sm" variant="outline" className="w-full">
              <ExternalLink data-icon="inline-start" />
              Invite teammate
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({ label, on }: { label: string; on?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch defaultChecked={!!on} />
    </div>
  );
}
