import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentTenantId } from "@/lib/session";
import {
  getBrandsForTenant,
  getCampaignsForTenant,
  getTheme,
  getWidgetsForTenant,
} from "@/lib/data/store";
import { ExternalLink, Globe2, Layers } from "lucide-react";

export default async function BrandsPage() {
  const tenantId = await getCurrentTenantId();
  const brands = getBrandsForTenant(tenantId);
  const campaigns = getCampaignsForTenant(tenantId);
  const widgets = getWidgetsForTenant(tenantId);

  return (
    <>
      <PageHeader
        title="Brands"
        description="Each brand is a self-contained customer-facing surface with its own currency, locale, default theme, and jackpot configuration."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {brands.map((b) => {
          const theme = getTheme(b.defaultThemeId);
          const brandCampaigns = campaigns.filter((c) =>
            c.brandIds.includes(b.id)
          );
          const brandWidgets = widgets.filter((w) => w.brandId === b.id);
          return (
            <Card
              key={b.id}
              className="group relative overflow-hidden transition-all hover:-translate-y-0.5"
            >
              <div
                className="absolute inset-x-0 top-0 h-40 opacity-40 transition-opacity group-hover:opacity-70"
                style={{
                  background: `linear-gradient(150deg, ${b.color ?? "#a855f7"} 0%, transparent 75%)`,
                }}
              />
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div
                    className="grid size-12 place-items-center rounded-xl border border-border/60 text-xl font-bold"
                    style={{
                      background: b.color ?? "transparent",
                      color: "white",
                    }}
                  >
                    {b.name[0]}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="truncate">{b.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                      <Globe2 className="size-3" />
                      {b.slug}.jackpotato.app
                    </CardDescription>
                  </div>
                  <Badge
                    variant={b.status === "active" ? "secondary" : "outline"}
                    className="ml-auto capitalize"
                  >
                    {b.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative grid gap-3 text-sm">
                <Row>
                  <span className="text-muted-foreground">Currency</span>
                  <span className="font-medium tabular">{b.currency}</span>
                </Row>
                <Row>
                  <span className="text-muted-foreground">Locale</span>
                  <span className="font-medium">{b.locale}</span>
                </Row>
                <Row>
                  <span className="text-muted-foreground">Default theme</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: theme?.tokens.primary }}
                    />
                    {theme?.name ?? "—"}
                  </span>
                </Row>
                <div className="mt-1 flex items-center gap-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Layers className="size-3" />
                    {brandCampaigns.length} campaigns
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ExternalLink className="size-3" />
                    {brandWidgets.length} widgets
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">{children}</div>
  );
}
