import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Gauge,
  Trophy,
  Wand2,
  ShieldCheck,
  Infinity as InfinityIcon,
  Globe,
  LineChart,
  Sparkles,
  Radio,
  Network,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroJackpotBanner } from "@/components/widgets/hero-jackpot-banner";
import { MustDropMeter } from "@/components/widgets/must-drop-meter";
import { StickyJackpotWidget } from "@/components/widgets/sticky-jackpot-widget";
import { LiveTile } from "@/components/marketing/live-tile";
import { buildLiveCampaign, buildThemeById } from "@/lib/public";

export default function JackpotsPage() {
  const mega = buildLiveCampaign("cmp_mega");
  const daily = buildLiveCampaign("cmp_daily");
  const hourly = buildLiveCampaign("cmp_hourly");
  const neon = buildThemeById("thm_neon_midnight")!;
  const gold = buildThemeById("thm_royal_gold")!;
  const sunset = buildThemeById("thm_crypto_sunset")!;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative mx-auto w-full max-w-7xl px-6 pt-16 pb-20 sm:pt-24">
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

        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-center">
          <div className="flex flex-col gap-6">
            <Badge variant="outline" className="w-fit rounded-full">
              <Zap data-icon="inline-start" /> Product · Jackpot Engine
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
              TurboPot.{" "}
              <span className="gradient-text">
                The jackpot engine built for scale.
              </span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Progressive pots, must-drop timers, and network jackpots — all
              ingesting bets in real time, funding tiers on every spin, and
              dropping winners across every one of your brands.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                render={
                  <Link href="/admin/campaigns">
                    Explore campaigns
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                }
                size="xl"
                className="rounded-full"
              />
              <Button
                render={<Link href="/widgets-demo">See the widgets</Link>}
                variant="outline"
                size="xl"
                className="rounded-full"
              />
            </div>
          </div>

          {mega ? (
            <HeroJackpotBanner
              live={mega}
              theme={neon}
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
        </div>
      </section>

      {/* Live tiers strip */}
      <section className="mx-auto w-full max-w-7xl px-6 pb-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mega && (
            <LiveTile
              live={mega}
              theme={neon}
              label="MEGA DROP"
              tagline="Biggest progressive jackpot"
            />
          )}
          {daily && (
            <LiveTile
              live={daily}
              theme={gold}
              label="DAILY DROP"
              tagline="Must drop before $5,000"
            />
          )}
          {hourly && (
            <LiveTile
              live={hourly}
              theme={sunset}
              label="HOURLY BLAZE"
              tagline="Must drop every hour"
            />
          )}
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Feature block: Flexibility */}
      <section className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-24">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[1.1fr_1fr] items-center">
          <div className="flex flex-col gap-4">
            <Badge className="rounded-full w-fit">TurboPot</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
              Flexible campaigns, any trigger, any currency, any tier.
            </h2>
            <p className="text-muted-foreground">
              Launch local, branded, or network-wide jackpots in minutes. Each
              campaign supports up to four tiers, independent contribution
              percentages, must-drop ceilings, time windows, and any number of
              currencies — all configurable live, with zero downtime.
            </p>
            <ul className="grid grid-cols-2 gap-3 mt-2">
              {[
                {
                  Icon: Zap,
                  t: "Four tiers per campaign",
                  d: "Mega, Major, Minor, Mini — or your own naming.",
                },
                {
                  Icon: Timer,
                  t: "Must-drop windows",
                  d: "Time-bound or value-bound ceilings, per tier.",
                },
                {
                  Icon: Network,
                  t: "Network jackpots",
                  d: "Pool contributions across brands and vendors.",
                },
                {
                  Icon: InfinityIcon,
                  t: "Multi-currency",
                  d: "EUR, GBP, USD, BTC, ETH — seamlessly.",
                },
              ].map(({ Icon, t, d }) => (
                <li
                  key={t}
                  className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-3"
                >
                  <Icon className="text-primary size-4 mt-0.5" />
                  <div>
                    <span className="font-medium">{t}</span>
                    <p className="text-xs text-muted-foreground">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Button
              render={
                <Link href="/admin/campaigns">
                  Open the campaign builder
                  <ArrowRight data-icon="inline-end" />
                </Link>
              }
              variant="outline"
              size="lg"
              className="rounded-full w-fit mt-2"
            />
          </div>
          {daily ? (
            <MustDropMeter
              live={daily}
              theme={gold}
              config={{
                countdown: true,
                pulse: false,
              }}
            />
          ) : null}
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Feature block: Realtime + insights */}
      <section className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-24">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[1fr_1.1fr] items-center">
          <div className="order-2 lg:order-1 rounded-3xl border border-border/60 bg-card/40 p-5">
            {mega ? (
              <StickyJackpotWidget
                live={mega}
                theme={neon}
                positioning="static"
                defaultOpen
                config={{ clickDestination: "#" }}
              />
            ) : null}
          </div>
          <div className="order-1 lg:order-2 flex flex-col gap-4">
            <Badge variant="secondary" className="rounded-full w-fit">
              <Radio data-icon="inline-start" />
              Realtime
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
              Every event, on every surface, in milliseconds.
            </h2>
            <p className="text-muted-foreground">
              Bets stream in through a signed ingestion API and fan out to
              every widget, admin dashboard and analytics pipeline over SSE.
              The same event bus powers live pots, winner tickers, and
              downstream reporting — so what operators see and what players
              see can never drift.
            </p>
            <ul className="grid grid-cols-2 gap-3 mt-2">
              {[
                {
                  Icon: Gauge,
                  t: "Live pot updates",
                  d: "Pots reflect each contribution the second it lands.",
                },
                {
                  Icon: LineChart,
                  t: "Ops analytics",
                  d: "Throughput, RTP drift, tier health — in real time.",
                },
                {
                  Icon: ShieldCheck,
                  t: "Signed ingestion",
                  d: "HMAC-signed events, idempotent by ref key.",
                },
                {
                  Icon: Wand2,
                  t: "Sandbox mode",
                  d: "Drive synthetic load for rehearsals and demos.",
                },
              ].map(({ Icon, t, d }) => (
                <li
                  key={t}
                  className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-3"
                >
                  <Icon className="text-primary size-4 mt-0.5" />
                  <div>
                    <span className="font-medium">{t}</span>
                    <p className="text-xs text-muted-foreground">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Button
              render={<Link href="/admin/live">Open live monitor</Link>}
              variant="outline"
              size="lg"
              className="rounded-full w-fit mt-2"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Widgets strip */}
      <section className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-24">
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
          <Badge variant="outline" className="rounded-full">
            <Sparkles data-icon="inline-start" />
            Widget library
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
            Ten drop-in surfaces for every page.
          </h2>
          <p className="text-muted-foreground">
            Hero banners, sticky pots, must-drop meters, ticker bars, winner
            spotlights, leaderboards and game-tile badges. Each inherits your
            brand theme, renders identically on web and mobile, and can be
            shipped via script tag, React SDK or iframe.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {[
              "Hero Banner",
              "Tier Cards",
              "Sticky",
              "Must-Drop Meter",
              "Winner Ticker",
              "Winner Spotlight",
              "Leaderboard",
              "Activity Feed",
              "Odometer",
              "Game Badge",
            ].map((n) => (
              <span
                key={n}
                className="rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground"
              >
                {n}
              </span>
            ))}
          </div>
          <Button
            render={
              <Link href="/widgets-demo">
                Open widget gallery
                <ArrowRight data-icon="inline-end" />
              </Link>
            }
            size="lg"
            className="rounded-full mt-2"
          />
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Stats band */}
      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-4 rounded-3xl border border-border bg-card/40 p-6 sm:p-10">
          {[
            { k: "30%", v: "more revenue with smarter jackpots" },
            { k: "4", v: "tiers per campaign" },
            { k: "Realtime", v: "updates via WebSocket and SSE" },
            { k: "∞", v: "brands, vendors, currencies" },
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

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-24 text-center">
        <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">
          Ship your first jackpot{" "}
          <span className="gradient-text">this week.</span>
        </h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          The same engine powers real-time pots for operators running local
          campaigns, network jackpots, and branded event drops. Book a demo to
          see it on your own stack.
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
          <Button
            render={
              <Link href="/rewards">
                <Globe data-icon="inline-start" />
                See Rewards product
              </Link>
            }
            variant="ghost"
            size="xl"
            className="rounded-full"
          />
        </div>
      </section>
    </div>
  );
}
