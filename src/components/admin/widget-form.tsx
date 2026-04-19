"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Save, ArrowLeft, Monitor, Tablet, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveWidget, type WidgetFormInput } from "@/app/actions/widgets";
import type {
  Brand,
  JackpotCampaign,
  WidgetTheme,
  WidgetType,
} from "@/lib/types";
import { WidgetPreview } from "@/components/admin/widget-preview";
import type { LiveCampaign } from "@/components/widgets/shared";
import { resolveTheme } from "@/lib/theme";

const WIDGET_TYPE_OPTIONS: { value: WidgetType; label: string; hint: string }[] = [
  { value: "hero", label: "Hero banner", hint: "Big landing-page centrepiece." },
  { value: "tier_cards", label: "Tier cards", hint: "One big card per jackpot tier." },
  { value: "sticky", label: "Sticky widget", hint: "Floating dock with live totals." },
  { value: "must_drop_meter", label: "Must-drop meter", hint: "Countdown tension." },
  { value: "winner_ticker", label: "Winner ticker", hint: "Scrolling recent wins." },
  { value: "winner_spotlight", label: "Winner spotlight", hint: "Hero-style single winner." },
  { value: "leaderboard", label: "Leaderboard", hint: "Ranked top players." },
  { value: "activity_feed", label: "Live activity feed", hint: "Chat-style event stream." },
  { value: "odometer", label: "Jackpot odometer", hint: "Slim horizontal total." },
  { value: "game_badge", label: "Game card badge", hint: "Tiny in-tile overlay." },
];

export function WidgetForm({
  initial,
  brands,
  campaigns,
  themes,
  liveByCampaign,
}: {
  initial?: WidgetFormInput;
  brands: Brand[];
  campaigns: JackpotCampaign[];
  themes: WidgetTheme[];
  liveByCampaign: Record<string, LiveCampaign>;
}) {
  const [pending, start] = useTransition();
  const [form, setForm] = useState<WidgetFormInput>(
    initial ?? {
      name: "",
      type: "hero",
      brandId: brands[0]?.id ?? "",
      campaignId: campaigns[0]?.id ?? "",
      themeId: themes[0]?.id ?? "",
      status: "draft",
      config: {
        headline: "Win life-changing jackpots",
        subheadline: "Live totals, every spin.",
        showTiers: false,
        animationLevel: "full",
        pulse: true,
        compactMode: false,
        showIcon: true,
        showFlag: true,
      },
    }
  );

  const theme = themes.find((t) => t.id === form.themeId);
  const live = form.campaignId ? liveByCampaign[form.campaignId] ?? null : null;
  const resolvedTokens = useMemo(
    () => (theme ? resolveTheme({ widgetTheme: theme }) : null),
    [theme]
  );

  function patch<K extends keyof WidgetFormInput>(key: K, value: WidgetFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function patchConfig(p: Partial<WidgetFormInput["config"]>) {
    setForm((prev) => ({ ...prev, config: { ...prev.config, ...p } }));
  }

  function submit() {
    if (!form.name.trim()) {
      toast.error("Give your widget a name");
      return;
    }
    if (!form.brandId || !form.campaignId || !form.themeId) {
      toast.error("Brand, campaign, and theme are required");
      return;
    }
    start(async () => {
      await saveWidget(form);
      toast.success("Widget saved");
    });
  }

  return (
    <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
            <CardDescription>
              Name, surface type, and where this widget draws its data from.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="wdg-name">Name</Label>
              <Input
                id="wdg-name"
                placeholder="e.g. Homepage hero — EU"
                value={form.name}
                onChange={(e) => patch("name", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Type</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {WIDGET_TYPE_OPTIONS.map((opt) => {
                  const active = form.type === opt.value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => patch("type", opt.value)}
                      className={`group flex flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                        active
                          ? "border-primary/60 bg-primary/10"
                          : "border-border/60 hover:border-border"
                      }`}
                    >
                      <span className="text-sm font-medium">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {opt.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label>Brand</Label>
                <Select
                  value={form.brandId}
                  onValueChange={(v) => patch("brandId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Campaign</Label>
                <Select
                  value={form.campaignId}
                  onValueChange={(v) => patch("campaignId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Theme</Label>
                <Select
                  value={form.themeId}
                  onValueChange={(v) => patch("themeId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
              <div>
                <div className="text-sm font-medium">Status</div>
                <div className="text-xs text-muted-foreground">
                  Live widgets serve to embeds; draft stays hidden.
                </div>
              </div>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  patch("status", v as WidgetFormInput["status"])
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Copy &amp; behaviour</CardTitle>
            <CardDescription>
              Optional overrides. Leave blank to use smart defaults from the
              campaign.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="wdg-headline">Headline</Label>
              <Input
                id="wdg-headline"
                value={form.config.headline ?? ""}
                onChange={(e) => patchConfig({ headline: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wdg-subheadline">Subheadline</Label>
              <Input
                id="wdg-subheadline"
                value={form.config.subheadline ?? ""}
                onChange={(e) => patchConfig({ subheadline: e.target.value })}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                <div>
                  <div className="text-sm font-medium">Show tiers</div>
                  <div className="text-xs text-muted-foreground">
                    Display Mega/Major/Minor breakdowns.
                  </div>
                </div>
                <Switch
                  checked={!!form.config.showTiers}
                  onCheckedChange={(v) => patchConfig({ showTiers: v })}
                />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                <div>
                  <div className="text-sm font-medium">Pulse on updates</div>
                  <div className="text-xs text-muted-foreground">
                    Soft glow when jackpot ticks.
                  </div>
                </div>
                <Switch
                  checked={!!form.config.pulse}
                  onCheckedChange={(v) => patchConfig({ pulse: v })}
                />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                <div>
                  <div className="text-sm font-medium">Compact mode</div>
                  <div className="text-xs text-muted-foreground">
                    Tighter layout for small slots.
                  </div>
                </div>
                <Switch
                  checked={!!form.config.compactMode}
                  onCheckedChange={(v) => patchConfig({ compactMode: v })}
                />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                <div>
                  <div className="text-sm font-medium">Show country flag</div>
                  <div className="text-xs text-muted-foreground">
                    For winner widgets.
                  </div>
                </div>
                <Switch
                  checked={!!form.config.showFlag}
                  onCheckedChange={(v) => patchConfig({ showFlag: v })}
                />
              </label>
            </div>
          </CardContent>
        </Card>

      <FormPreview
        form={form}
        live={live}
        resolvedTokens={resolvedTokens}
      />

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          render={
            <Link href="/admin/widgets">
              <ArrowLeft data-icon="inline-start" />
              Back
            </Link>
          }
        />
        <Button onClick={submit} disabled={pending} size="lg">
          <Save data-icon="inline-start" />
          {pending ? "Saving…" : initial?.id ? "Save widget" : "Create widget"}
        </Button>
      </div>
    </div>
  );
}

type Viewport = "mobile" | "tablet" | "desktop";

const VIEWPORTS: {
  id: Viewport;
  label: string;
  icon: typeof Monitor;
  width: number;
}[] = [
  { id: "mobile", label: "Mobile", icon: Smartphone, width: 380 },
  { id: "tablet", label: "Tablet", icon: Tablet, width: 768 },
  { id: "desktop", label: "Desktop", icon: Monitor, width: 1200 },
];

function FormPreview({
  form,
  live,
  resolvedTokens,
}: {
  form: WidgetFormInput;
  live: LiveCampaign | null;
  resolvedTokens: ReturnType<typeof resolveTheme> | null;
}) {
  // Widget types that mostly sit inline in a page flow look best wide by
  // default, while dock/overlay types feel more honest at phone size.
  const [viewport, setViewport] = useState<Viewport>(() =>
    form.type === "sticky" || form.type === "game_badge"
      ? "mobile"
      : "desktop"
  );
  const vp = VIEWPORTS.find((v) => v.id === viewport)!;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
        <div>
          <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">
            Live preview
          </CardTitle>
          <CardDescription>
            Resizing the frame is purely visual — save the widget to lock in
            real placement rules.
          </CardDescription>
        </div>
        <div
          role="tablist"
          aria-label="Preview viewport"
          className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 p-1"
        >
          {VIEWPORTS.map((v) => {
            const Icon = v.icon;
            const active = v.id === viewport;
            return (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setViewport(v.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        {live && resolvedTokens ? (
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-[linear-gradient(135deg,oklch(0.16_0.03_280),oklch(0.1_0.02_280))] p-4 sm:p-6">
            <div className="mx-auto w-full" style={{ maxWidth: vp.width }}>
              <div
                className={cn(
                  "rounded-2xl border border-border/50 bg-background/30 p-3 sm:p-4 transition-[max-width]",
                  viewport === "mobile" && "shadow-2xl"
                )}
              >
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-rose-500/60" />
                  <span className="size-2 rounded-full bg-amber-400/60" />
                  <span className="size-2 rounded-full bg-emerald-500/60" />
                  <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {viewport} · {vp.width}px
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <WidgetPreview
                    widget={{
                      id: "preview",
                      tenantId: "preview",
                      brandId: form.brandId,
                      campaignId: form.campaignId,
                      name: form.name || "Untitled widget",
                      type: form.type,
                      themeId: form.themeId,
                      status: form.status,
                      config: form.config,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    }}
                    theme={resolvedTokens}
                    live={live}
                    winners={[]}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid h-48 place-items-center rounded-xl border border-dashed text-xs text-muted-foreground">
            Pick a brand, campaign, and theme to preview.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
