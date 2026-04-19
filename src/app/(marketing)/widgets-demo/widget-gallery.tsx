"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Sparkles, Trophy, Zap } from "lucide-react";
import { HeroJackpotBanner } from "@/components/widgets/hero-jackpot-banner";
import { StickyJackpotWidget } from "@/components/widgets/sticky-jackpot-widget";
import { MustDropMeter } from "@/components/widgets/must-drop-meter";
import { RecentWinnerTicker } from "@/components/widgets/recent-winner-ticker";
import { GameCardBadge } from "@/components/widgets/game-card-badge";
import type { LiveCampaign } from "@/components/widgets/shared";
import type { JackpotWin, ThemeTokens } from "@/lib/types";
import { toast } from "sonner";

export function WidgetGallery({
  themes,
  campaigns,
  liveByCampaign,
  winners,
}: {
  themes: Array<{ id: string; name: string; tokens: ThemeTokens }>;
  campaigns: Array<{ id: string; name: string; currency: string }>;
  liveByCampaign: Record<string, LiveCampaign>;
  winners: JackpotWin[];
}) {
  const [themeId, setThemeId] = useState(themes[0].id);
  const [campaignId, setCampaignId] = useState(campaigns[0].id);
  const [pulse, setPulse] = useState(true);
  const [showTiers, setShowTiers] = useState(true);
  const [anonymize, setAnonymize] = useState(false);

  const theme = themes.find((t) => t.id === themeId)!.tokens;
  const live = liveByCampaign[campaignId];

  async function triggerTestWin() {
    const res = await fetch("/api/admin/sandbox/trigger-win", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId }),
    });
    if (res.ok) {
      toast.success("Test win triggered — watch the widgets light up.");
    } else {
      toast.error("Could not trigger win.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <Badge variant="outline" className="rounded-full w-fit">
          Widget playground
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight max-w-3xl">
          Five widgets. Infinite brands.{" "}
          <span className="gradient-text">One live engine.</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Every widget below is wired to the same real-time engine. Change the theme or campaign and they all update — or fire a test win and watch the celebrations.
        </p>

        <Card className="mt-4">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle>Live controls</CardTitle>
                <CardDescription>
                  Swap theme + campaign to see white-label styling and realtime updates at work.
                </CardDescription>
              </div>
              <Button onClick={triggerTestWin} className="rounded-full">
                <Trophy data-icon="inline-start" />
                Trigger test win
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <FieldGroup className="sm:grid-cols-2 md:grid-cols-4">
              <Field>
                <FieldLabel>Theme</FieldLabel>
                <Select value={themeId} onValueChange={setThemeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {themes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Campaign</FieldLabel>
                <Select value={campaignId} onValueChange={setCampaignId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {campaigns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} · {c.currency}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field orientation="horizontal">
                <FieldLabel>Pulse effect</FieldLabel>
                <Switch checked={pulse} onCheckedChange={setPulse} />
              </Field>
              <Field orientation="horizontal">
                <FieldLabel>Show tiers</FieldLabel>
                <Switch checked={showTiers} onCheckedChange={setShowTiers} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </header>

      <Separator />

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary size-4" />
          <h2 className="font-display text-2xl font-semibold">Hero Jackpot Banner</h2>
          <Badge variant="secondary" className="rounded-full">Homepage · Lobby</Badge>
        </div>
        <HeroJackpotBanner
          live={live}
          theme={theme}
          config={{
            headline: "Every spin. A chance to win.",
            subheadline: "Four tiers. One unstoppable progressive.",
            ctaLabel: "Play now",
            ctaUrl: "#",
            showTiers,
            pulse,
            animationLevel: "full",
          }}
        />
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Zap className="text-primary size-4" />
            <h2 className="font-display text-2xl font-semibold">Must-Drop Meter</h2>
          </div>
          <MustDropMeter
            live={live}
            theme={theme}
            config={{ countdown: true }}
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="text-primary size-4" />
            <h2 className="font-display text-2xl font-semibold">Sticky Widget</h2>
          </div>
          <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-border bg-card/40">
            <div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">
              (preview surface — sticky anchors to the corner)
            </div>
            <StickyJackpotWidget
              live={live}
              theme={theme}
              positioning="absolute"
              config={{ pulse, clickDestination: "#" }}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="text-primary size-4" />
          <h2 className="font-display text-2xl font-semibold">Recent Winner Ticker</h2>
          <Field orientation="horizontal" className="ml-auto">
            <FieldLabel>Anonymize</FieldLabel>
            <Switch checked={anonymize} onCheckedChange={setAnonymize} />
          </Field>
        </div>
        <RecentWinnerTicker
          initial={winners}
          theme={theme}
          config={{ tickerMode: "ticker", anonymize, showFlag: true, maxItems: 20 }}
        />
        <div className="flex justify-center pt-6">
          <RecentWinnerTicker
            initial={winners}
            theme={theme}
            config={{
              tickerMode: "toast",
              anonymize,
              showFlag: true,
              maxItems: 8,
              autoRotateSpeed: 3,
            }}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary size-4" />
          <h2 className="font-display text-2xl font-semibold">Game Card Badge</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Book of Gold",
            "Sweet Bonanza",
            "Gates of Olympus",
            "Neon City",
          ].map((g) => (
            <div
              key={g}
              className="relative overflow-hidden rounded-2xl border border-border aspect-[4/3]"
              style={{
                background:
                  "radial-gradient(600px 240px at 0% 100%, oklch(0.72 0.22 300 / 30%), transparent 60%), radial-gradient(400px 200px at 100% 0%, oklch(0.84 0.19 85 / 20%), transparent 60%), linear-gradient(135deg, oklch(0.25 0.04 280), oklch(0.18 0.03 280))",
              }}
            >
              <div className="absolute top-3 left-3">
                <GameCardBadge live={live} theme={theme} />
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <span className="font-display text-lg font-semibold">{g}</span>
                <span className="text-xs text-muted-foreground">Slots</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
