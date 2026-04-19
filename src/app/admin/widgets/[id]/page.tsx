import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { WidgetPreview } from "@/components/admin/widget-preview";
import { CodeBlock } from "@/components/admin/code-block";
import {
  getCampaign,
  getRecentWinners,
  getWidget,
  store,
} from "@/lib/data/store";
import { buildLiveCampaign, buildThemeForWidget } from "@/lib/public";
import { apiSnippet, htmlSnippet, iframeSnippet, reactSnippet } from "@/lib/embed";
import { Code2, Palette, SlidersHorizontal } from "lucide-react";

export default async function WidgetDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const widget = getWidget(id);
  if (!widget) notFound();
  const theme = buildThemeForWidget(widget.id)!;
  const live = buildLiveCampaign(widget.campaignId)!;
  const camp = getCampaign(widget.campaignId);
  const brand = store.brands.find((b) => b.id === widget.brandId);
  const winners = getRecentWinners(10, widget.tenantId);

  return (
    <>
      <PageHeader
        title={widget.name}
        description={`${brand?.name ?? ""} · ${camp?.name ?? ""}`}
        actions={
          <>
            <Badge variant="secondary" className="capitalize">
              {widget.type.replace("_", " ")}
            </Badge>
            <Badge
              variant={widget.status === "live" ? "secondary" : "outline"}
              className="capitalize"
            >
              {widget.status}
            </Badge>
          </>
        }
      />

      <div className="mb-6 rounded-2xl border border-border/60 bg-gradient-to-br from-muted/20 to-transparent p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Live preview
          </span>
          <span className="text-xs text-muted-foreground">
            Updates in real time from the engine.
          </span>
        </div>
        <WidgetPreview
          widget={widget}
          theme={theme}
          live={live}
          winners={winners}
        />
      </div>

      <Tabs defaultValue="config">
        <TabsList>
          <TabsTrigger value="config">
            <SlidersHorizontal data-icon="inline-start" />
            Config
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette data-icon="inline-start" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="embed" id="embed">
            <Code2 data-icon="inline-start" />
            Embed
          </TabsTrigger>
        </TabsList>
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Everything this widget exposes to the page. Settings apply in
                real time across all embeds.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {Object.entries(widget.config).map(([k, v]) => (
                <div
                  key={k}
                  className="flex flex-col gap-0.5 rounded-lg border border-border/60 bg-muted/20 p-3"
                >
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    {k.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="font-medium">
                    {typeof v === "boolean" ? (v ? "Yes" : "No") : String(v)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Resolved theme</CardTitle>
              <CardDescription>
                Final tokens after merging platform → tenant → brand → widget
                overrides.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {[
                  ["primary", theme.primary],
                  ["secondary", theme.secondary],
                  ["accent", theme.accent],
                  ["bg", theme.bg],
                  ["card", theme.card],
                  ["text", theme.text],
                  ["glow", theme.glow],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3"
                  >
                    <span
                      className="size-10 rounded-md border border-border/60"
                      style={{ background: v }}
                    />
                    <div className="min-w-0 leading-tight">
                      <div className="font-medium">{k}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {v}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  render={<Link href="/admin/themes">Open theme editor</Link>}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="embed">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Script tag</CardTitle>
                <CardDescription>
                  Drop-in snippet for any site. The loader fetches config,
                  styles, and opens a realtime stream.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock code={htmlSnippet(widget)} language="html" />
              </CardContent>
            </Card>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>iFrame</CardTitle>
                  <CardDescription>
                    Fully isolated rendering. Great for strict CSPs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CodeBlock code={iframeSnippet(widget)} language="html" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>React SDK</CardTitle>
                  <CardDescription>
                    Typed, themed, tree-shakable React components.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CodeBlock code={reactSnippet(widget)} language="tsx" />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Headless API</CardTitle>
                <CardDescription>
                  Bring your own UI. Fetch JSON, render however you like.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock code={apiSnippet(widget)} language="javascript" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
