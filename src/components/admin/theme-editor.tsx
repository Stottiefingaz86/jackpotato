"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Check } from "lucide-react";
import { HeroJackpotBanner } from "@/components/widgets/hero-jackpot-banner";
import { StickyJackpotWidget } from "@/components/widgets/sticky-jackpot-widget";
import { MustDropMeter } from "@/components/widgets/must-drop-meter";
import { ThemeScope } from "@/components/widgets/theme-scope";
import type { LiveCampaign } from "@/components/widgets/shared";
import type { ThemeTokens, WidgetTheme } from "@/lib/types";
import { saveTheme } from "@/app/actions/themes";

export function ThemeEditor({
  themes,
  initial,
  live,
}: {
  themes: WidgetTheme[];
  initial: WidgetTheme;
  live: LiveCampaign;
}) {
  const [selectedId, setSelectedId] = useState(initial.id);
  const base = themes.find((t) => t.id === selectedId) ?? initial;
  const [draft, setDraft] = useState<WidgetTheme>(base);
  const [isPending, start] = useTransition();

  const tokens: ThemeTokens = draft.tokens;

  function select(id: string) {
    const t = themes.find((x) => x.id === id);
    if (!t) return;
    setSelectedId(id);
    setDraft(t);
  }

  function patch(p: Partial<ThemeTokens>) {
    setDraft((prev) => ({
      ...prev,
      tokens: {
        ...prev.tokens,
        ...p,
        motion: { ...prev.tokens.motion, ...(p.motion ?? {}) },
      },
    }));
  }

  function submit() {
    start(async () => {
      await saveTheme({
        id: draft.id,
        name: draft.name,
        description: draft.description,
        tokens: draft.tokens,
      });
      toast.success("Theme saved");
    });
  }

  const swatches = useMemo(
    () => [
      { k: "primary", label: "Primary", v: tokens.primary },
      { k: "secondary", label: "Secondary", v: tokens.secondary },
      { k: "accent", label: "Accent", v: tokens.accent },
      { k: "bg", label: "Background", v: tokens.bg },
      { k: "card", label: "Card", v: tokens.card },
      { k: "text", label: "Text", v: tokens.text },
    ],
    [tokens]
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Presets</CardTitle>
            <CardDescription>
              Start from a preset or duplicate any theme you own.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => select(t.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition ${t.id === selectedId ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex -space-x-1.5">
                    <span
                      className="size-5 rounded-full border border-background"
                      style={{ background: t.tokens.primary }}
                    />
                    <span
                      className="size-5 rounded-full border border-background"
                      style={{ background: t.tokens.secondary }}
                    />
                    <span
                      className="size-5 rounded-full border border-background"
                      style={{ background: t.tokens.accent }}
                    />
                  </div>
                  <span className="truncate text-sm font-medium">{t.name}</span>
                </div>
                {t.id === selectedId && (
                  <Check className="size-4 text-primary" />
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label>Theme name</Label>
              <Input
                value={draft.name}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={draft.description ?? ""}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Optional"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Colors</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {swatches.map((s) => (
              <div key={s.k} className="flex items-center gap-2">
                <input
                  type="color"
                  value={toHex(s.v)}
                  onChange={(e) => patch({ [s.k]: e.target.value } as Partial<ThemeTokens>)}
                  className="size-9 cursor-pointer rounded-md border-0"
                />
                <div className="flex-1">
                  <Label className="text-xs">{s.label}</Label>
                  <Input
                    value={s.v}
                    onChange={(e) => patch({ [s.k]: e.target.value } as Partial<ThemeTokens>)}
                    className="h-8 font-mono text-xs"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Motion & style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row>
              <Label className="mb-0">Pulse on update</Label>
              <Switch
                checked={tokens.motion.pulse}
                onCheckedChange={(v) =>
                  patch({ motion: { ...tokens.motion, pulse: v } })
                }
              />
            </Row>
            <Row>
              <Label className="mb-0">Glow</Label>
              <Switch
                checked={tokens.motion.glow}
                onCheckedChange={(v) =>
                  patch({ motion: { ...tokens.motion, glow: v } })
                }
              />
            </Row>
            <Row>
              <Label className="mb-0">Celebrate wins</Label>
              <Switch
                checked={tokens.motion.celebrate}
                onCheckedChange={(v) =>
                  patch({ motion: { ...tokens.motion, celebrate: v } })
                }
              />
            </Row>
            <div className="grid gap-2">
              <Label>Density</Label>
              <Select
                value={tokens.density}
                onValueChange={(v) => patch({ density: v as ThemeTokens["density"] })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Radius</Label>
              <Input
                value={tokens.radius}
                onChange={(e) => patch({ radius: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          disabled={isPending}
          onClick={submit}
          className="w-full h-11 rounded-full"
        >
          <Save data-icon="inline-start" />
          {isPending ? "Saving..." : "Save theme"}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Live preview
          </span>
          <Badge variant="outline" className="rounded-full">
            {draft.name}
          </Badge>
        </div>
        <ThemeScope tokens={tokens}>
          <div className="space-y-4">
            <HeroJackpotBanner
              live={live}
              theme={tokens}
              config={{
                headline: draft.name,
                subheadline: "Theme preview — everything updates live.",
                showTiers: true,
                animationLevel: "full",
                pulse: true,
              }}
            />
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
              <MustDropMeter
                live={live}
                theme={tokens}
                config={{ animationLevel: "full" }}
              />
              <div className="relative min-h-[220px] rounded-xl bg-zinc-950/60 p-4">
                <div className="absolute bottom-4 right-4">
                  <StickyJackpotWidget
                    live={live}
                    theme={tokens}
                    config={{ pulse: true }}
                  />
                </div>
              </div>
            </div>
          </div>
        </ThemeScope>
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between">{children}</div>;
}

/** Attempt to coerce any color string to a hex so <input type=color> works. */
function toHex(color: string) {
  if (color.startsWith("#")) return color;
  try {
    if (typeof document !== "undefined") {
      const d = document.createElement("div");
      d.style.color = color;
      document.body.appendChild(d);
      const rgb = getComputedStyle(d).color;
      document.body.removeChild(d);
      const m = rgb.match(/\d+/g);
      if (!m) return "#a855f7";
      const [r, g, b] = m.map(Number);
      return `#${[r, g, b]
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("")}`;
    }
  } catch {}
  return "#a855f7";
}
