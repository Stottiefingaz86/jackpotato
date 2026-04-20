import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Gauge,
  LineChart,
  Trophy,
  Wand2,
  ShieldCheck,
  Infinity as InfinityIcon,
  Package,
  Ticket,
  Gift,
  Flame,
  Target,
  Crown,
  Medal,
  Layers,
  Activity,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroJackpotBanner } from "@/components/widgets/hero-jackpot-banner";
import { LiveTile } from "@/components/marketing/live-tile";
import { RecentWinnerTicker } from "@/components/widgets/recent-winner-ticker";
import { StickyJackpotWidget } from "@/components/widgets/sticky-jackpot-widget";
import { buildLiveCampaign, buildThemeById } from "@/lib/public";
import { getRecentWinners } from "@/lib/data/store";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const megaLive = buildLiveCampaign("cmp_mega");
  const dailyLive = buildLiveCampaign("cmp_daily");
  const hourlyLive = buildLiveCampaign("cmp_hourly");
  const neon = buildThemeById("thm_neon_midnight")!;
  const gold = buildThemeById("thm_royal_gold")!;
  const sunset = buildThemeById("thm_crypto_sunset")!;
  const classic = buildThemeById("thm_casino_classic")!;
  const winners = getRecentWinners(20);

  return (
    <div className="flex flex-col">
      {/* Floating sticky jackpot widget — starts as a pill, expands on click */}
      {megaLive ? (
        <StickyJackpotWidget
          live={megaLive}
          theme={neon}
          positioning="fixed"
          defaultOpen={false}
          config={{ clickDestination: "#" }}
        />
      ) : null}

      {/* Hero */}
      <section className="relative mx-auto w-full max-w-7xl px-6 pt-16 pb-20 sm:pt-24">
        {/* Hero background — the same "light beams" pattern we render behind
         * the Mega Drop card. Slim vertical bars set on a 120px rhythm and
         * rotated 12deg so they feel architectural rather than striped.
         * Uncolored (plain white at low alpha) to match the user's ask for
         * "just a line pattern". Masked at the edges so it fades into the
         * section rather than ending in a hard rectangle. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-40"
          style={{
            maskImage:
              "radial-gradient(ellipse 80% 70% at 50% 45%, black 10%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 70% at 50% 45%, black 10%, transparent 85%)",
          }}
        >
          <div
            className="absolute -inset-40 rotate-12"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, oklch(1 0 0 / 3%) 0 1px, transparent 1px 160px)",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-start gap-8">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
            <span
              className="size-1.5 rounded-full bg-primary"
              data-icon="inline-start"
            />
            Jackpots + Rewards · one realtime engine
          </Badge>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight max-w-4xl">
            <span className="block">Jackpots.</span>
            <span className="block">Rewards.</span>
            <span className="block gradient-text">One engagement engine.</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Progressive jackpots and rank-driven rewards on a single realtime
            engine. Launch multi-brand campaigns, segment players by VIP tier,
            and compound session length, retention and LTV across every
            vertical — with nothing to glue together.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              render={
                <Link href="/admin">
                  Book a Demo
                  <ArrowRight data-icon="inline-end" />
                </Link>
              }
              size="xl"
              className="rounded-full"
            />
            <Button
              render={<Link href="/widgets-demo">Explore widgets</Link>}
              variant="outline"
              size="xl"
              className="rounded-full"
            />
          </div>
        </div>

        {/* Live jackpot tiles */}
        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {megaLive ? (
            <LiveTile
              live={megaLive}
              theme={neon}
              label="Mega Drop"
              size="lg"
              tagline="Biggest progressive jackpot"
            />
          ) : null}
          {dailyLive ? (
            <LiveTile
              live={dailyLive}
              theme={gold}
              label="Daily Drop"
              size="lg"
              tagline="Must drop before $5,000"
            />
          ) : null}
          {hourlyLive ? (
            <LiveTile
              live={hourlyLive}
              theme={sunset}
              label="Hourly Blaze"
              size="lg"
              tagline="Must drop every hour"
            />
          ) : null}
        </div>

        {/* Ticker strip */}
        <div className="mt-8">
          <RecentWinnerTicker
            initial={winners}
            theme={neon}
            config={{ tickerMode: "ticker", showFlag: true, maxItems: 20 }}
          />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-7xl px-6 py-24 sm:py-28">
        <div className="flex flex-col gap-4 mb-10 max-w-3xl">
          <Badge variant="outline" className="rounded-full w-fit">How it works</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
            One bet event. Every engagement format.
          </h2>
          <p className="text-muted-foreground">
            Jackpots, crates, raffles, ranks, races — all driven by the same
            ingestion pipeline, admin shell, and theme system. Configure once.
            Scope per brand, vertical or VIP tier. Ship without redeploys.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              num: "01",
              title: "Configure any campaign",
              desc: "Progressive pots, must-drop timers, loot crates, ticketed raffles and VIP rank tiers — one admin, one theme system, multi-brand scoping built in.",
              Icon: Wand2,
            },
            {
              num: "02",
              title: "Ingest every event",
              desc: "A single bet-event API feeds every widget, leaderboard, crate unlock and rank promotion in realtime — via WebSocket or SSE, sub-50ms.",
              Icon: Gauge,
            },
            {
              num: "03",
              title: "Compound LTV",
              desc: "Combining jackpots with ranked rewards lifts session length, retention and revenue by up to 30%. Segment by tier, A/B test, iterate live.",
              Icon: LineChart,
            },
          ].map(({ num, title, desc, Icon }) => (
            <div
              key={num}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card/60 p-6"
            >
              <div className="flex items-start justify-between">
                <span className="text-muted-foreground text-sm tabular">{num}</span>
                <Icon className="text-primary size-6" />
              </div>
              <h3 className="mt-8 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background:
                    "radial-gradient(500px 200px at 50% 120%, oklch(0.72 0.22 300 / 14%), transparent 60%)",
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Our products — two clearly separated product lines */}
      <section
        id="products"
        className="relative mx-auto w-full max-w-7xl px-6 py-24 sm:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(600px 260px at 50% 30%, oklch(0.72 0.22 300 / 14%), transparent 70%), radial-gradient(500px 220px at 50% 90%, oklch(0.84 0.19 85 / 10%), transparent 70%)",
          }}
        />
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <Badge variant="outline" className="rounded-full">
            Our products
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.1] tracking-tight">
            Two products.{" "}
            <span className="gradient-text">
              One engagement engine.
            </span>
          </h2>
          <p className="max-w-2xl text-muted-foreground text-base sm:text-lg">
            Run <b>Jackpots</b> for progressive pots and must-drop campaigns.
            Stack the <b>Rewards Platform</b> on top for crates, raffles, VIP
            ranks — and soon cash races, challenges and missions. Jackpots or
            Rewards alone move metrics. Combined, they compound.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Jackpots product card */}
          <div className="relative flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/40">
            <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
              <span className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary">
                <Zap className="size-4" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Product · TurboPot
                </span>
                <span className="font-display text-lg font-semibold">
                  Jackpot Engine
                </span>
              </div>
              <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary">
                Live
              </span>
            </div>
            <div className="p-6 flex flex-col gap-5">
              {megaLive ? (
                <HeroJackpotBanner
                  live={megaLive}
                  theme={neon}
                  compact
                  config={{
                    headline: "Mega Drop Network",
                    subheadline: "One unstoppable progressive jackpot.",
                    ctaLabel: "Spin to win",
                    ctaUrl: "#",
                    showTiers: false,
                    animationLevel: "full",
                    pulse: true,
                  }}
                />
              ) : null}
              <p className="text-sm text-muted-foreground">
                Progressive pots, tiered drops, must-drop timers and network
                jackpots. Rank-gated payouts, multi-currency, multi-brand —
                fully instrumented from first bet to settlement.
              </p>
              <ul className="grid grid-cols-2 gap-2">
                {[
                  { Icon: Zap, t: "4 jackpot tiers" },
                  { Icon: InfinityIcon, t: "Network + local pots" },
                  { Icon: Gauge, t: "Must-drop timers" },
                  { Icon: Crown, t: "Rank-gated wins" },
                ].map(({ Icon, t }) => (
                  <li
                    key={t}
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-xs"
                  >
                    <Icon className="text-primary size-3.5 shrink-0" />
                    <span className="truncate">{t}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <Button
                  render={
                    <Link href="/jackpots">
                      Explore Jackpot Engine
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  }
                  size="lg"
                  className="rounded-full"
                />
                <Button
                  render={<Link href="/admin/campaigns">Open admin</Link>}
                  variant="outline"
                  size="lg"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Rewards platform product card */}
          <div className="relative flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/40">
            <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
              <span className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary">
                <Gift className="size-4" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Product · Rewards Platform
                </span>
                <span className="font-display text-lg font-semibold">
                  Engagement, loyalty & gamification
                </span>
              </div>
              <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary">
                New
              </span>
            </div>
            <div className="p-6 flex flex-col gap-5">
              {/* Format showcase — makes it unambiguous that Rewards is a
               * PLATFORM of multiple engagement formats. Six themed tiles:
               * Crate Drops, Raffles, VIP Ranks (live) and Cash Races,
               * Challenges, Missions (shipping). Each has its own accent so
               * operators can see the full product breadth at a glance. */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  {
                    Icon: Package,
                    label: "Crate Drops",
                    tagline: "Loot unlocks",
                    state: "Live",
                    gradient:
                      "radial-gradient(110% 120% at 10% 0%, oklch(0.55 0.22 300 / 55%), transparent 60%), linear-gradient(135deg, oklch(0.22 0.06 300), oklch(0.16 0.04 285))",
                    accent: "oklch(0.78 0.2 300)",
                  },
                  {
                    Icon: Ticket,
                    label: "Raffles",
                    tagline: "Ticket draws",
                    state: "Live",
                    gradient:
                      "radial-gradient(110% 120% at 10% 0%, oklch(0.68 0.18 80 / 50%), transparent 60%), linear-gradient(135deg, oklch(0.24 0.05 75), oklch(0.16 0.03 70))",
                    accent: "oklch(0.85 0.18 85)",
                  },
                  {
                    Icon: Crown,
                    label: "VIP Ranks",
                    tagline: "Segmentation spine",
                    state: "Live",
                    gradient:
                      "radial-gradient(110% 120% at 10% 0%, oklch(0.62 0.18 150 / 50%), transparent 60%), linear-gradient(135deg, oklch(0.22 0.06 150), oklch(0.15 0.04 145))",
                    accent: "oklch(0.8 0.18 155)",
                  },
                  {
                    Icon: Flame,
                    label: "Cash Races",
                    tagline: "Leaderboard sprints",
                    state: "Soon",
                    gradient:
                      "radial-gradient(110% 120% at 10% 0%, oklch(0.6 0.24 20 / 45%), transparent 60%), linear-gradient(135deg, oklch(0.22 0.06 20), oklch(0.15 0.04 15))",
                    accent: "oklch(0.75 0.2 25)",
                  },
                  {
                    Icon: Medal,
                    label: "Challenges",
                    tagline: "Quests & streaks",
                    state: "Soon",
                    gradient:
                      "radial-gradient(110% 120% at 10% 0%, oklch(0.6 0.2 230 / 45%), transparent 60%), linear-gradient(135deg, oklch(0.22 0.06 225), oklch(0.15 0.04 220))",
                    accent: "oklch(0.78 0.17 230)",
                  },
                  {
                    Icon: Target,
                    label: "Missions",
                    tagline: "XP & progression",
                    state: "Soon",
                    gradient:
                      "radial-gradient(110% 120% at 10% 0%, oklch(0.6 0.16 180 / 45%), transparent 60%), linear-gradient(135deg, oklch(0.22 0.05 180), oklch(0.15 0.03 180))",
                    accent: "oklch(0.78 0.15 180)",
                  },
                ].map(({ Icon, label, tagline, state, gradient, accent }) => (
                  <div
                    key={label}
                    className="relative flex flex-col gap-2 overflow-hidden rounded-xl border border-border/60 p-3"
                    style={{ background: gradient }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="grid size-8 place-items-center rounded-lg ring-1 ring-white/10"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(1 0 0 / 8%), oklch(1 0 0 / 2%))",
                          color: accent,
                        }}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-px text-[10px] uppercase tracking-wide",
                          state === "Live"
                            ? "bg-white/10 text-white/85"
                            : "bg-white/5 text-white/55"
                        )}
                      >
                        {state}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-col leading-tight">
                      <span className="text-sm font-semibold text-white/95">
                        {label}
                      </span>
                      <span className="text-[11px] text-white/60">
                        {tagline}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                Every play feeds one progression spine. Crates, raffles and
                VIP ranks live today; cash races, challenges and missions
                next — all targetable by rank, brand and vertical from day
                one.
              </p>
              <ul className="grid grid-cols-2 gap-2">
                {[
                  { Icon: Crown, t: "Segment by VIP rank" },
                  { Icon: Target, t: "Rank-gated rewards" },
                  { Icon: Trophy, t: "Cross-format XP" },
                  { Icon: ShieldCheck, t: "Per-brand scoping" },
                ].map(({ Icon, t }) => (
                  <li
                    key={t}
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-xs"
                  >
                    <Icon className="text-primary size-3.5 shrink-0" />
                    <span className="truncate">{t}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <Button
                  render={
                    <Link href="/rewards">
                      Explore Rewards Platform
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  }
                  size="lg"
                  className="rounded-full"
                />
                <Button
                  render={<Link href="/admin/crates">Open admin</Link>}
                  variant="outline"
                  size="lg"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Combine them — the 1 + 1 = 3 message made explicit */}
        <div
          className="relative mt-10 overflow-hidden rounded-3xl border border-border/70 p-8 sm:p-10"
          style={{
            background:
              "radial-gradient(700px 300px at 0% 0%, oklch(0.72 0.22 300 / 18%), transparent 65%), radial-gradient(700px 300px at 100% 100%, oklch(0.84 0.19 85 / 14%), transparent 65%), linear-gradient(180deg, oklch(0.18 0.025 280 / 85%), oklch(0.15 0.02 275 / 85%))",
          }}
        >
          <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] items-center">
            <div className="flex flex-col gap-4">
              <Badge variant="outline" className="rounded-full w-fit">
                <Layers data-icon="inline-start" />
                Jackpots + Rewards
              </Badge>
              <h3 className="font-display text-2xl sm:text-3xl font-semibold leading-tight">
                Combined, they compound.{" "}
                <span className="gradient-text">
                  This is the stack players can&apos;t put down.
                </span>
              </h3>
              <p className="text-muted-foreground">
                Rank-gated must-drops. VIP-only loot crates. Jackpot wins that
                seed raffle tickets. A single XP spine that crosses every
                format. Ship it as a bundle, measure it as a system, iterate
                on it live.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  render={
                    <Link href="/admin/campaigns">
                      Design a combined campaign
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  }
                  size="lg"
                  className="rounded-full"
                />
                <Button
                  render={<Link href="/admin/sandbox">Try the sandbox</Link>}
                  variant="outline"
                  size="lg"
                  className="rounded-full"
                />
              </div>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {[
                {
                  Icon: Crown,
                  t: "Rank-gated must-drops",
                  d: "Only Gold+ triggers the $100K pot.",
                },
                {
                  Icon: Package,
                  t: "VIP-only loot crates",
                  d: "Scope rarities by tier in the admin.",
                },
                {
                  Icon: Ticket,
                  t: "Jackpot → raffle seeding",
                  d: "Every pot won auto-grants draw tickets.",
                },
                {
                  Icon: Activity,
                  t: "Cross-format XP",
                  d: "One spine powers every progression.",
                },
              ].map(({ Icon, t, d }) => (
                <li
                  key={t}
                  className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/30 p-3"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary shrink-0">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{t}</div>
                    <div className="text-xs text-muted-foreground">{d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Stats band */}
      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-4 rounded-3xl border border-border bg-card/40 p-6 sm:p-10">
          {[
            { k: "+30%", v: "revenue uplift with the combined stack" },
            { k: "6", v: "reward formats — 3 live, 3 shipping" },
            { k: "<50ms", v: "end-to-end event latency, every format" },
            { k: "∞", v: "brands, verticals and rank tiers per tenant" },
          ].map((s) => (
            <div key={s.v} className="flex flex-col gap-1">
              <span className="font-display text-3xl sm:text-4xl font-semibold gradient-text">
                {s.k}
              </span>
              <span className="text-sm text-muted-foreground">{s.v}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="text-center flex flex-col items-center gap-3 mb-10">
          <Badge variant="outline" className="rounded-full">FAQ</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold">
            Operator questions, answered.
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            From must-drop mechanics to rank-gated rewards — everything an
            operator needs to know before going live on jackpots, rewards, or
            both.
          </p>
        </div>
        <Accordion className="w-full">
          {[
            {
              q: "What is TurboPot?",
              a: "TurboPot is a realtime engagement platform for online casinos. Two products — Jackpots (progressive pots, must-drop timers, network pots) and the Rewards Platform (crates, raffles, VIP ranks, and soon cash races, challenges and missions) — run on one ingestion pipeline, one admin shell and one theme system.",
            },
            {
              q: "Why does combining Jackpots + Rewards matter?",
              a: "Jackpots drive acquisition and peak-moment excitement. Rewards drive return visits and long-term loyalty. Combining them — rank-gated must-drops, VIP-only loot crates, jackpot wins that seed raffle tickets, a single XP spine — is where operators see the biggest revenue and LTV lift. Every format is instrumented as one system, not three vendors glued together.",
            },
            {
              q: "What do VIP Ranks unlock?",
              a: "Ranks are the segmentation spine of the platform. Every other format — jackpots, crates, raffles, challenges — can be scoped to a rank tier without extra code. Ranks auto-progress from wager activity, feed campaign targeting, and carry a full audit trail for ops and compliance reviews.",
            },
            {
              q: "How do Crate Drops work?",
              a: "Crates are unlockable loot earned through gameplay — betting, spin streaks, wins, or manual VIP awards. Each opens to reveal cash, free spins, free bets, deposit matches or multipliers, with operators controlling rarity tiers, prize pools, rank gating and expected value.",
            },
            {
              q: "How are Raffles different from jackpots?",
              a: "Raffles are fixed-duration, ticket-based draws. Instead of a progressive pool that grows with every spin, players earn tickets through play and the prize is drawn at a scheduled time — perfect for weekend marketing pushes, VIP exclusives, and launch events with a hard deadline.",
            },
            {
              q: "What is a must-drop jackpot?",
              a: "A must-drop jackpot is a progressive prize guaranteed to pay out before reaching a set time or amount, creating urgency and boosting player engagement. Gate it by VIP rank for a high-tier-only experience.",
            },
            {
              q: "Can I run campaigns across multiple brands?",
              a: "Yes — every format supports per-tenant, per-brand and per-vertical scoping out of the box. Run network jackpots across brands, or keep crates and raffles exclusive to a single brand. All from one admin.",
            },
            {
              q: "Can I customize RTP contributions per jackpot?",
              a: "Absolutely. Full control over RTP, contribution splits, tiers, triggers, seeding and rank gates per jackpot — tune profitability and campaign strategy without redeploying.",
            },
          ].map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-7xl px-6 py-20">
        <div
          className="relative overflow-hidden rounded-3xl border border-border p-10 sm:p-16 text-center"
          style={{
            background:
              "radial-gradient(900px 400px at 50% 0%, oklch(0.72 0.22 300 / 18%), transparent 60%), radial-gradient(900px 400px at 50% 100%, oklch(0.84 0.19 85 / 14%), transparent 60%), oklch(0.16 0.02 275 / 70%)",
          }}
        >
          <h2 className="font-display text-3xl sm:text-5xl font-semibold leading-tight">
            Ready to level up your casino?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Go live with your first jackpot, crate or raffle today — one
            admin, one engine, every engagement format you&apos;ll ever ship.
            Built with online casinos in mind.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <Button
              render={
                <Link href="/admin">
                  Book a Demo
                  <ArrowRight data-icon="inline-end" />
                </Link>
              }
              size="xl"
              className="rounded-full"
            />
            <Button
              render={<Link href="/admin/sandbox">Try the sandbox</Link>}
              variant="outline"
              size="xl"
              className="rounded-full"
            />
          </div>

          {dailyLive ? (
            <div className="mt-10 mx-auto max-w-md">
              <LiveTile
                live={dailyLive}
                theme={classic}
                label="Dropping now"
                tagline="Daily drop countdown"
              />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
