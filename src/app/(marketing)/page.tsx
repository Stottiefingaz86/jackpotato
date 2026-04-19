import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Gauge,
  LineChart,
  Trophy,
  Wand2,
  ShieldCheck,
  Infinity as InfinityIcon,
  Globe,
  Package,
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
import { CrateCard } from "@/components/crates/crate-card";
import { buildLiveCampaign, buildThemeById } from "@/lib/public";
import { getCratesForTenant, getRecentWinners } from "@/lib/data/store";

export default function LandingPage() {
  const megaLive = buildLiveCampaign("cmp_mega");
  const dailyLive = buildLiveCampaign("cmp_daily");
  const hourlyLive = buildLiveCampaign("cmp_hourly");
  const neon = buildThemeById("thm_neon_midnight")!;
  const gold = buildThemeById("thm_royal_gold")!;
  const sunset = buildThemeById("thm_crypto_sunset")!;
  const classic = buildThemeById("thm_casino_classic")!;
  const winners = getRecentWinners(20);
  const crates = getCratesForTenant("tnt_jackpotato").filter(
    (c) => c.status === "live"
  );
  const featuredCrate =
    crates.find((c) => c.rarity === "legendary") ?? crates[0];

  return (
    <div className="flex flex-col">
      {/* Floating sticky jackpot widget — starts as a pill, expands on click */}
      {megaLive ? (
        <StickyJackpotWidget
          live={megaLive}
          theme={neon}
          positioning="fixed"
          defaultOpen={false}
          config={{ clickDestination: "#", pulse: true }}
        />
      ) : null}

      {/* Hero */}
      <section className="relative mx-auto w-full max-w-7xl px-6 pt-16 pb-20 sm:pt-24">
        <div className="flex flex-col items-start gap-8">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
            <span
              className="size-1.5 rounded-full bg-primary"
              data-icon="inline-start"
            />
            Live platform · real-time jackpot engine
          </Badge>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight max-w-4xl">
            <span className="block">Flexible.</span>
            <span className="block">Powerful.</span>
            <span className="block gradient-text">Your jackpot engine.</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Launch custom, scalable jackpots across any gaming vertical. Jackpotato is a next-gen jackpot management system for online casinos — seamlessly integrated, highly profitable, and designed to boost player engagement on every spin.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              render={
                <Link href="/admin">
                  <Sparkles data-icon="inline-start" />
                  Book a Demo
                </Link>
              }
              variant="outline"
              size="xl"
              className="rounded-full"
            />
            <Button
              render={
                <Link href="/widgets-demo">
                  Explore widgets
                  <ArrowRight data-icon="inline-end" />
                </Link>
              }
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
      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <Badge variant="outline" className="rounded-full">How it works</Badge>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold max-w-2xl leading-tight">
              Powerful jackpot software. Maximizing casino revenue.
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md">
            Configure, launch, and monitor jackpots in minutes. Increase player retention and drive up to 30% more revenue with smarter engagement tools.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              num: "01",
              title: "Launch Custom Campaigns",
              desc: "Launch custom jackpots tailored to your games, player base, and engagement strategy. Next-gen pools with complete control and zero hassle.",
              Icon: Wand2,
            },
            {
              num: "02",
              title: "Real-Time Engagement Insights",
              desc: "Go live in minutes with a powerful jackpot management system. Advanced tracking dashboards and automated alerts for online casinos.",
              Icon: Gauge,
            },
            {
              num: "03",
              title: "Make Money, Smarter",
              desc: "Up to 30% more revenue through smarter jackpot management, targeted incentives, and optimized engagement tools for operators.",
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

      {/* Products */}
      <section id="products" className="mx-auto w-full max-w-7xl px-6 py-16">
        <Badge variant="outline" className="rounded-full">Our products</Badge>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold max-w-3xl leading-tight mb-10">
          The complete engagement stack, white-labeled for every brand.
        </h2>

        <div className="grid gap-10">
          {/* Jackpotato */}
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] items-center">
            <div className="flex flex-col gap-4">
              <Badge className="rounded-full w-fit">Jackpotato</Badge>
              <h3 className="font-display text-2xl sm:text-3xl font-semibold leading-tight">
                Jackpot engine built for true flexibility, engagement and growth.
              </h3>
              <p className="text-muted-foreground">
                Tired of rigid, outdated jackpot tools? Jackpotato delivers a powerful, flexible jackpot solution built for online casinos. Whether you’re running local campaigns or massive network jackpots, launch and manage custom jackpots fast — with full control, seamless integration, and advanced player engagement features.
              </p>
              <ul className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { Icon: Zap, t: "Ultimate Flexibility", d: "Multiple tiers, triggers and themes — no downtime." },
                  { Icon: InfinityIcon, t: "Multi-Brand", d: "Run jackpots across games, brands, and networks." },
                  { Icon: Gauge, t: "Realtime Insights", d: "Track performance live with actionable analytics." },
                  { Icon: Trophy, t: "Built to boost revenue", d: "Convert, retain, and maximize profits." },
                ].map(({ Icon, t, d }) => (
                  <li key={t} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-3">
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
                    Explore Jackpotato <ArrowRight data-icon="inline-end" />
                  </Link>
                }
                variant="outline"
                size="lg"
                className="rounded-full w-fit mt-2"
              />
            </div>
            {megaLive ? (
              <HeroJackpotBanner
                live={megaLive}
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

          {/* Crate Drops */}
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] items-center">
            {featuredCrate ? (
              <div className="mx-auto w-full max-w-sm">
                <CrateCard crate={featuredCrate} />
              </div>
            ) : null}
            <div className="flex flex-col gap-4">
              <Badge className="rounded-full w-fit" variant="secondary">
                <Package data-icon="inline-start" />
                Crate Drops
              </Badge>
              <h3 className="font-display text-2xl sm:text-3xl font-semibold leading-tight">
                Unlockable loot crates that keep every spin thrilling.
              </h3>
              <p className="text-muted-foreground">
                Crate Drops turn gameplay into a loop of anticipation. Players unlock crates by betting, spinning, or hitting streaks — then pop them open for cash, free spins, free bets and deposit matches. Operators tune rarity, prize pools and trigger conditions live without redeploying a single game.
              </p>
              <ul className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { Icon: Package, t: "5 rarity tiers", d: "Common → Mythic, each with its own rewards." },
                  { Icon: Zap, t: "Flexible triggers", d: "Stake, spins, streaks, or manual VIP drops." },
                  { Icon: Trophy, t: "Real prizes", d: "Cash, free spins, free bets, bonuses, multipliers." },
                  { Icon: ShieldCheck, t: "Operator controls", d: "Expected value, daily caps, brand scoping." },
                ].map(({ Icon, t, d }) => (
                  <li key={t} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-3">
                    <Icon className="text-primary size-4 mt-0.5" />
                    <div>
                      <span className="font-medium">{t}</span>
                      <p className="text-xs text-muted-foreground">{d}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <Button
                  render={
                    <Link href="/crates">
                      Explore crates <ArrowRight data-icon="inline-end" />
                    </Link>
                  }
                  variant="outline"
                  size="lg"
                  className="rounded-full w-fit"
                />
                <Button
                  render={
                    <Link href="/admin/crates">
                      Configure in admin
                    </Link>
                  }
                  variant="outline"
                  size="lg"
                  className="rounded-full w-fit"
                />
              </div>
            </div>
          </div>

          {/* Rarity showcase strip */}
          {crates.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {crates.slice(0, 4).map((c) => (
                <CrateCard key={c.id} crate={c} compact />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats band */}
      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-4 rounded-3xl border border-border bg-card/40 p-6 sm:p-10">
          {[
            { k: "30%", v: "more revenue with smarter jackpots" },
            { k: "4", v: "jackpot types supported" },
            { k: "Realtime", v: "updates via WebSocket and SSE" },
            { k: "∞", v: "brand and vendor configurations" },
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
            Your jackpot questions, answered.
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            From must-drop mechanics to network jackpots — everything an operator needs to know before going live.
          </p>
        </div>
        <Accordion className="w-full">
          {[
            {
              q: "What is Jackpotato?",
              a: "Jackpotato is a customizable jackpot management system designed for online casinos, allowing operators to launch flexible jackpots across multiple games, brands, and networks with ease.",
            },
            {
              q: "How do Crate Drops work?",
              a: "Crate Drops are unlockable loot crates earned through gameplay — betting, spin streaks, wins, or manual VIP awards. Each crate opens to reveal cash, free spins, free bets, deposit matches or multipliers, with operators controlling rarity tiers, prize pools, and expected value.",
            },
            {
              q: "Can I run jackpots across multiple brands?",
              a: "Yes — you can easily launch network jackpots across different brands and markets from one central management system.",
            },
            {
              q: "What is a must-drop jackpot?",
              a: "A must-drop jackpot is a progressive prize that is guaranteed to pay out before reaching a set time or amount, creating urgency and boosting player engagement on casino games.",
            },
            {
              q: "What is the difference between local and network jackpots?",
              a: "A local jackpot is exclusive to a single operator or casino brand, while a network jackpot pools contributions from multiple brands to create larger, faster-growing prizes.",
            },
            {
              q: "Can I customize RTP contributions per jackpot?",
              a: "Absolutely. Jackpotato gives full control over RTP, contribution splits, tiers, triggers, and seeding per jackpot to optimize profitability and campaign strategy.",
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
            Go live with your first jackpot campaign now. Convert more players with the only jackpot engine built with online casinos in mind.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <Button
              render={
                <Link href="/admin">
                  <Sparkles data-icon="inline-start" />
                  Book a Demo
                </Link>
              }
              variant="outline"
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
