import Link from "next/link";
import {
  ArrowRight,
  Gift,
  Package,
  Ticket,
  Trophy,
  Gauge,
  ShieldCheck,
  Zap,
  Target,
  Flame,
  Medal,
  Sparkles,
  Clock,
  Crown,
  Users,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CrateCard } from "@/components/crates/crate-card";
import { RaffleCard } from "@/components/raffles/raffle-card";
import { RafflePlayWidget } from "@/components/raffles/raffle-play-widget";
import { RankLadder } from "@/components/rewards/widgets/rank-ladder";
import { RewardsWidgetsShowcase } from "./rewards-widgets-showcase";
import {
  getCratesForTenant,
  getRafflesForTenant,
  store,
} from "@/lib/data/store";
import { resolveTheme } from "@/lib/theme";

const ROADMAP = [
  {
    Icon: Flame,
    title: "Cash Races",
    tagline: "Time-boxed leaderboard sprints",
    description:
      "Stake-weighted leaderboards with automatic payout splits, tier thresholds, and live anti-collusion guards.",
    eta: "Q3",
  },
  {
    Icon: Medal,
    title: "Challenges",
    tagline: "Single-session quests",
    description:
      "Hit X spins, land Y symbols, clear a bonus — reward players the moment they complete, with per-game rulesets.",
    eta: "Q3",
  },
  {
    Icon: Target,
    title: "Missions",
    tagline: "Multi-stage progression",
    description:
      "Daily, weekly and seasonal mission trees with branching rewards, XP tracks, and soft streak protection.",
    eta: "Q4",
  },
];

export default function RewardsPage() {
  const crates = getCratesForTenant("tnt_turbopot").filter(
    (c) => c.status === "live"
  );
  const featuredCrate =
    crates.find((c) => c.rarity === "legendary") ?? crates[0];
  const raffles = getRafflesForTenant("tnt_turbopot")
    .filter((r) => r.status === "live")
    .slice(0, 3);
  const featuredRaffle = raffles[0];

  // Surface the same theme presets used by the widget gallery + admin
  // theme editor so the rewards page can be reskinned with a single click.
  // Prefer our brand-aligned preset ("Neon Midnight") up front; keep the
  // rest in alphabetical order.
  const DEFAULT_PRESET_ID = "thm_neon_midnight";
  const widgetPresets = store.themes
    .slice()
    .sort((a, b) => {
      if (a.id === DEFAULT_PRESET_ID) return -1;
      if (b.id === DEFAULT_PRESET_ID) return 1;
      return a.name.localeCompare(b.name);
    })
    .map((t) => ({
      id: t.id,
      name: t.name,
      tokens: resolveTheme({ widgetTheme: t }),
    }));

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
              <Gift data-icon="inline-start" /> Product · Rewards Platform
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
              Engagement, loyalty &{" "}
              <span className="gradient-text">gamification.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              A single platform to turn every bet, streak, deposit and session
              into an engagement loop. Loot crates, ticketed raffles, VIP
              ranks — and shipping soon, cash races, challenges and missions
              — all built on the same realtime engine as TurboPot, all
              operator-tunable, all branded.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                render={
                  <Link href="/crates">
                    Explore crates
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                }
                size="xl"
                className="rounded-full"
              />
              <Button
                render={<Link href="/admin/raffles">Configure in admin</Link>}
                variant="outline"
                size="xl"
                className="rounded-full"
              />
            </div>
          </div>

          {featuredCrate ? (
            <div className="mx-auto w-full max-w-sm">
              <CrateCard crate={featuredCrate} />
            </div>
          ) : null}
        </div>
      </section>

      {/* Reward chips */}
      <section className="mx-auto w-full max-w-7xl px-6 pb-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { Icon: Package, label: "Crate Drops", live: true },
            { Icon: Ticket, label: "Raffles", live: true },
            { Icon: Crown, label: "VIP Ranks", live: true },
            { Icon: Flame, label: "Cash Races", live: false },
            { Icon: Medal, label: "Challenges", live: false },
            { Icon: Target, label: "Missions", live: false },
          ].map(({ Icon, label, live }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-3 py-1 text-xs text-muted-foreground"
            >
              <Icon className="size-3.5 text-primary" />
              {label}
              {live ? (
                <span className="rounded-full bg-primary/15 px-1.5 py-px text-[10px] uppercase tracking-wide text-primary">
                  Live
                </span>
              ) : (
                <span className="rounded-full bg-muted/40 px-1.5 py-px text-[10px] uppercase tracking-wide text-muted-foreground">
                  Soon
                </span>
              )}
            </span>
          ))}
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Crate Drops */}
      <section id="crates" className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-24 scroll-mt-24">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[1fr_1.1fr] items-center">
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
            <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
              Unlockable loot crates that keep every spin thrilling.
            </h2>
            <p className="text-muted-foreground">
              Crate Drops turn gameplay into a loop of anticipation. Players
              unlock crates by betting, spinning, or hitting streaks — then
              pop them open for cash, free spins, free bets and deposit
              matches. Operators tune rarity, prize pools and trigger
              conditions live without redeploying a single game.
            </p>
            <ul className="grid grid-cols-2 gap-3 mt-2">
              {[
                {
                  Icon: Package,
                  t: "5 rarity tiers",
                  d: "Common → Mythic, each with its own rewards.",
                },
                {
                  Icon: Zap,
                  t: "Flexible triggers",
                  d: "Stake, spins, streaks, or manual VIP drops.",
                },
                {
                  Icon: Trophy,
                  t: "Real prizes",
                  d: "Cash, free spins, free bets, bonuses, multipliers.",
                },
                {
                  Icon: ShieldCheck,
                  t: "Operator controls",
                  d: "Expected value, daily caps, brand scoping.",
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
                  <Link href="/admin/crates">Configure in admin</Link>
                }
                variant="outline"
                size="lg"
                className="rounded-full w-fit"
              />
            </div>
          </div>
        </div>

        {crates.length > 0 && (
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {crates.slice(0, 4).map((c) => (
              <CrateCard key={c.id} crate={c} compact />
            ))}
          </div>
        )}
      </section>

      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Raffles */}
      <section
        id="raffles"
        className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-24 scroll-mt-24"
      >
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[1.1fr_1fr] items-center">
          <div className="flex flex-col gap-4">
            <Badge className="rounded-full w-fit" variant="secondary">
              <Ticket data-icon="inline-start" />
              Raffles
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
              Ticket-based draws that turn activity into anticipation.
            </h2>
            <p className="text-muted-foreground">
              Raffles reward sustained play with a shot at a showstopper
              prize. Players earn tickets by betting, depositing, or hitting
              spin streaks — then everyone watches the countdown together
              until the draw. Operators set the trigger, ticket caps, prize
              pool, and brand scoping.
            </p>
            <ul className="grid grid-cols-2 gap-3 mt-2">
              {[
                {
                  Icon: Ticket,
                  t: "Weighted tickets",
                  d: "Earn-per-stake, spins, deposits, or manual.",
                },
                {
                  Icon: Trophy,
                  t: "Multi-prize pools",
                  d: "Grand + runner-up tiers with custom values.",
                },
                {
                  Icon: Gauge,
                  t: "Live countdown",
                  d: "Urgency built in across every widget surface.",
                },
                {
                  Icon: ShieldCheck,
                  t: "Fair by design",
                  d: "Deterministic draws with full audit trail.",
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
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <Button
                render={
                  <Link href="/admin/raffles">
                    Configure in admin
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                }
                variant="outline"
                size="lg"
                className="rounded-full w-fit"
              />
            </div>
          </div>
          <div className="mx-auto w-full max-w-md">
            <RafflePlayWidget
              accent={featuredRaffle?.color ?? "#a855f7"}
              title={featuredRaffle?.name ?? "Try the draw"}
              prizeLabel={
                featuredRaffle?.prizes[0]?.value
                  ? new Intl.NumberFormat("en-EU", {
                      style: "currency",
                      currency: featuredRaffle.prizes[0].currency ?? "EUR",
                      maximumFractionDigits: 0,
                    }).format(featuredRaffle.prizes[0].value)
                  : "€2,500"
              }
              prizeSubtitle={
                featuredRaffle?.prizes[0]?.label ?? "Grand prize"
              }
            />
          </div>
        </div>

        {raffles.length > 0 && (
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(featuredRaffle
              ? [featuredRaffle, ...raffles.slice(1, 3)]
              : raffles.slice(0, 3)
            ).map((r) => (
              <RaffleCard key={r.id} raffle={r} compact />
            ))}
          </div>
        )}
      </section>

      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* VIP Ranks — core product pillar */}
      <section
        id="ranks"
        className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-24 scroll-mt-24"
      >
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[1fr_1.1fr] items-center">
          <div className="flex flex-col gap-6">
            <div className="mx-auto w-full max-w-md">
              <RankLadder wagered={87_500} />
            </div>
            <div className="mx-auto w-full max-w-md">
              <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Rank segment — preview
                  </div>
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    <Filter data-icon="inline-start" />
                    Silver+
                  </Badge>
                </div>
                <ul className="space-y-2 text-sm">
                  {[
                    {
                      Icon: Package,
                      label: "Weekend Mega Crate",
                      tier: "Gold+",
                    },
                    {
                      Icon: Ticket,
                      label: "VIP Monthly Raffle",
                      tier: "Silver+",
                    },
                    {
                      Icon: Trophy,
                      label: "High-Roller Jackpot",
                      tier: "Diamond",
                    },
                  ].map(({ Icon, label, tier }) => (
                    <li
                      key={label}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/40 px-3 py-2"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <Icon className="size-4 text-primary shrink-0" />
                        <span className="truncate">{label}</span>
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground rounded-full bg-muted/40 px-2 py-0.5">
                        {tier}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Badge className="rounded-full w-fit" variant="secondary">
              <Crown data-icon="inline-start" />
              VIP Ranks
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
              Rank every player. Segment every campaign.
            </h2>
            <p className="text-muted-foreground">
              Ranks turn each wager into lifecycle progression — a live
              telemetry layer for VIP programs, campaign segmentation, and
              rank-gated rewards. Every other reward format — crates, raffles,
              jackpots, cash races — can be scoped to a tier without any extra
              plumbing. This is the segmentation spine of the platform.
            </p>
            <ul className="grid grid-cols-2 gap-3 mt-2">
              {[
                {
                  Icon: Crown,
                  t: "Auto tier progression",
                  d: "Wager-driven thresholds; players move up automatically.",
                },
                {
                  Icon: Target,
                  t: "Rank-gated rewards",
                  d: "Gate any crate, raffle, jackpot or bonus by tier.",
                },
                {
                  Icon: Users,
                  t: "Segmentation, live",
                  d: "Target campaigns to Bronze, Silver+, Gold-only, VIP.",
                },
                {
                  Icon: ShieldCheck,
                  t: "Full audit trail",
                  d: "Every promotion + demotion logged for ops and compliance.",
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
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <Button
                render={
                  <Link href="/admin/campaigns">
                    Segment a campaign
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                }
                variant="outline"
                size="lg"
                className="rounded-full w-fit"
              />
              <Button
                render={
                  <Link href="/admin/settings">Configure rank tiers</Link>
                }
                variant="outline"
                size="lg"
                className="rounded-full w-fit"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Widgets for every surface — client component with theme preset picker */}
      <RewardsWidgetsShowcase
        themes={widgetPresets}
        defaultThemeId={DEFAULT_PRESET_ID}
      />

      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Roadmap */}
      <section
        id="roadmap"
        className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-24 scroll-mt-24"
      >
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto mb-10">
          <Badge variant="outline" className="rounded-full">
            <Sparkles data-icon="inline-start" />
            Coming to Rewards
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
            Three new reward formats shipping this year.
          </h2>
          <p className="text-muted-foreground">
            Every format plugs into the same event bus as TurboPot and Crate
            Drops — so brand scoping, audit trails, and live analytics come
            for free. Drop a demo request if you want early access.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {ROADMAP.map(({ Icon, title, tagline, description, eta }) => (
            <div
              key={title}
              className="relative flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/40 p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <Clock className="size-3" />
                  {eta}
                </span>
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">{title}</h3>
                <p className="text-xs uppercase tracking-wide text-primary/80 mt-0.5">
                  {tagline}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-24 text-center">
        <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">
          Layer rewards onto your jackpots{" "}
          <span className="gradient-text">without re-deploying a thing.</span>
        </h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Crates and raffles share the same ingestion pipeline, the same admin
          shell and the same theme system as TurboPot. Turn features on per
          brand, per vertical, per campaign.
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
            render={<Link href="/admin/crates">Configure rewards</Link>}
            variant="outline"
            size="xl"
            className="rounded-full"
          />
          <Button
            render={
              <Link href="/jackpots">See Jackpot Engine product</Link>
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

