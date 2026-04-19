/**
 * Domain types mirror the Prisma-shaped entities in the product spec
 * (Section 15). They are stored in-memory today; the shape is stable so
 * a future Prisma schema can map 1:1.
 */

export type ID = string;
export type ISODate = string;

export type TenantType = "operator" | "vendor" | "internal";
export type TenantStatus = "active" | "suspended" | "archived";

export interface Tenant {
  id: ID;
  name: string;
  slug: string;
  type: TenantType;
  status: TenantStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type UserRole = "super_admin" | "tenant_admin" | "analyst" | "developer";

export interface User {
  id: ID;
  email: string;
  name: string;
  avatarUrl?: string;
  status: "active" | "invited" | "disabled";
  createdAt: ISODate;
}

export interface TenantMembership {
  id: ID;
  userId: ID;
  tenantId: ID;
  role: UserRole;
  createdAt: ISODate;
}

export type BrandStatus = "active" | "paused" | "archived";

export interface Brand {
  id: ID;
  tenantId: ID;
  name: string;
  slug: string;
  currency: string;
  locale: string;
  defaultThemeId: ID;
  status: BrandStatus;
  logoUrl?: string;
  color?: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type CampaignType =
  | "progressive"
  | "must_drop"
  | "local"
  | "network_ready";

export type CampaignStatus = "draft" | "active" | "paused" | "archived";

export interface TriggerRules {
  /** Random chance per contribution (0..1) for the Mega tier. */
  megaHitChancePerContribution?: number;
  /** Whether must-drop logic is enabled. */
  mustDropEnabled?: boolean;
  /** Maximum time between drops in seconds (optional). */
  maxDropIntervalSeconds?: number;
}

export interface JackpotCampaign {
  id: ID;
  tenantId: ID;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  currency: string;
  contributionRate: number;
  seedAmount: number;
  resetAmount: number;
  rules: TriggerRules;
  brandIds: ID[];
  startsAt: ISODate | null;
  endsAt: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface JackpotTier {
  id: ID;
  campaignId: ID;
  name: string;
  displayLabel: string;
  splitPercent: number;
  currentAmount: number;
  seedAmount: number;
  resetAmount: number;
  mustDropAmount?: number;
  mustDropAt?: ISODate | null;
  sortOrder: number;
  color?: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface EligibleGame {
  id: ID;
  campaignId: ID;
  gameId: string;
  provider: string;
  gameGroup: string;
  title: string;
  coverUrl?: string;
}

export interface BetEvent {
  id: ID;
  tenantId: ID;
  brandId: ID;
  playerId: string;
  gameId: string;
  gameGroup: string;
  stakeAmount: number;
  currency: string;
  externalRef?: string;
  createdAt: ISODate;
}

export interface ContributionEvent {
  id: ID;
  betEventId: ID;
  campaignId: ID;
  tierId: ID;
  amount: number;
  createdAt: ISODate;
}

export type TriggerType = "progressive" | "must_drop" | "manual";

export interface JackpotWin {
  id: ID;
  campaignId: ID;
  tierId: ID;
  tenantId: ID;
  brandId: ID;
  playerId: string;
  displayName: string;
  country?: string;
  gameId?: string;
  triggerType: TriggerType;
  winAmount: number;
  wonAt: ISODate;
}

export type ThemePattern =
  | "none"
  | "beams"
  | "grid"
  | "dots"
  | "aurora"
  | "noise"
  | "diagonal";

export interface ThemeTokens {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  card: string;
  card2: string;
  text: string;
  muted: string;
  border: string;
  radius: string;
  shadow: string;
  glow: string;
  fontHeading: string;
  fontBody: string;
  gradient: string;
  motion: {
    pulse: boolean;
    glow: boolean;
    celebrate: boolean;
  };
  density: "comfortable" | "compact";
  /**
   * Optional decorative pattern rendered behind widget content. Defaults to
   * "beams" (subtle vertical lines) when unset — the look from the original
   * Must-Drop Meter card. Widgets can override per-instance.
   */
  pattern?: ThemePattern;
  currency?: string;
  locale?: string;
}

export interface WidgetTheme {
  id: ID;
  tenantId: ID;
  name: string;
  description?: string;
  tokens: ThemeTokens;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type WidgetType =
  | "sticky"
  | "hero"
  | "tier_cards"
  | "must_drop_meter"
  | "winner_ticker"
  | "game_badge"
  | "leaderboard"
  | "winner_spotlight"
  | "odometer"
  | "activity_feed";

export type LeaderboardPeriod = "24h" | "7d" | "30d" | "all_time";
export type LeaderboardMetric = "total_won" | "wins" | "biggest_win";

export type WidgetStatus = "draft" | "live" | "paused";

export interface WidgetConfig {
  compactMode?: boolean;
  showIcon?: boolean;
  pulse?: boolean;
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  showTiers?: boolean;
  tierVisibility?: ID[];
  animationLevel?: "none" | "subtle" | "full";
  countdown?: boolean;
  /**
   * Recent-winner display mode.
   *   - `ticker`: classic horizontal marquee that scrolls the recent list.
   *   - `bar`: flat, dense horizontal strip. No leading icon, no pill chrome —
   *            designed to sit in a top/bottom bar that already has its own
   *            chrome (the "green bar" look).
   *   - `stack`: vertical list of rows, one winner per line. Great for
   *            sidebars where horizontal real estate is scarce.
   *   - `toast`: rotating single-winner notification with a soft entrance.
   */
  tickerMode?: "ticker" | "bar" | "stack" | "toast";
  showFlag?: boolean;
  anonymize?: boolean;
  autoRotateSpeed?: number;
  maxItems?: number;
  badgeText?: string;
  showAmount?: boolean;
  clickDestination?: string;
  leaderboardPeriod?: LeaderboardPeriod;
  leaderboardMetric?: LeaderboardMetric;
  showCountry?: boolean;
}

export interface Widget {
  id: ID;
  tenantId: ID;
  brandId: ID;
  campaignId: ID;
  name: string;
  type: WidgetType;
  themeId: ID;
  status: WidgetStatus;
  config: WidgetConfig;
  themeOverrides?: Partial<ThemeTokens>;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface WidgetPlacement {
  id: ID;
  widgetId: ID;
  placementName: string;
  pageType: "home" | "lobby" | "game" | "promo" | "checkout";
  deviceType: "all" | "desktop" | "mobile";
  rules: Record<string, unknown>;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type ApiKeyType = "public" | "secret";

export interface ApiKey {
  id: ID;
  tenantId: ID;
  label: string;
  type: ApiKeyType;
  preview: string;
  hashedKey: string;
  permissions: string[];
  lastUsedAt: ISODate | null;
  revokedAt: ISODate | null;
  createdAt: ISODate;
}

export interface AuditLog {
  id: ID;
  tenantId: ID;
  actorUserId: ID;
  entityType: string;
  entityId: ID;
  action: string;
  payload?: Record<string, unknown>;
  createdAt: ISODate;
}

/** Real-time event payloads emitted on the bus and forwarded via SSE. */
export type RealtimeEvent =
  | {
      type: "jackpot.updated";
      campaignId: ID;
      tierId: ID;
      currentAmount: number;
      contributionAmount: number;
      timestamp: ISODate;
    }
  | {
      type: "jackpot.won";
      campaignId: ID;
      tierId: ID;
      winAmount: number;
      playerDisplay: string;
      country?: string;
      gameId?: string;
      triggerType: TriggerType;
      timestamp: ISODate;
    }
  | {
      type: "bet.ingested";
      tenantId: ID;
      brandId: ID;
      gameId: string;
      stakeAmount: number;
      currency: string;
      timestamp: ISODate;
    }
  | {
      type: "campaign.paused" | "campaign.resumed";
      campaignId: ID;
      timestamp: ISODate;
    }
  | {
      type: "widget.updated";
      widgetId: ID;
      timestamp: ISODate;
    };

export interface PublicJackpotTier {
  tierId: ID;
  name: string;
  displayLabel: string;
  currentAmount: number;
  mustDropAmount?: number;
  splitPercent: number;
  color?: string;
}

export interface PublicJackpotCampaign {
  campaignId: ID;
  name: string;
  description?: string;
  type: CampaignType;
  currency: string;
  locale: string;
  status: CampaignStatus;
  tiers: PublicJackpotTier[];
}

/*
 * -----------------------------------------------------------------------
 * Crate Drops — gamification layer
 *
 * Crates are unlockable mystery rewards players earn during gameplay.
 * Each crate has a rarity that drives its visual treatment and a weighted
 * prize pool containing cash, free spins, free bets or bonus rewards.
 * -----------------------------------------------------------------------
 */

export type CrateRarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export type CratePrizeType =
  | "cash"
  | "freespins"
  | "freebet"
  | "bonus"
  | "multiplier";

export interface CratePrize {
  id: ID;
  type: CratePrizeType;
  label: string;
  /**
   * Value interpretation depends on type:
   * - cash / freebet: amount in the crate's currency
   * - freespins: number of spins
   * - bonus: percentage (e.g. 100 for 100% deposit match)
   * - multiplier: multiplier value (e.g. 2.5)
   */
  value: number;
  currency?: string;
  /** Relative weight used when picking a prize at open time. */
  weight: number;
  /** Optional extra copy shown under the prize on the reveal screen. */
  subtitle?: string;
}

export type CrateUnlockTrigger =
  | { kind: "stake_amount"; threshold: number; currency: string }
  | { kind: "spin_count"; count: number }
  | { kind: "win_streak"; streak: number }
  | { kind: "daily_login" }
  | { kind: "manual" };

export type CrateStatus = "draft" | "live" | "paused" | "archived";

/**
 * Visual + animation preset used by the `CrateArt` component on the card.
 * Each variant has a distinct idle / opening / opened animation so operators
 * can match the crate aesthetic to their brand.
 */
export type CrateArtVariant =
  | "chest"
  | "orb"
  | "gem"
  | "card"
  | "vault"
  | "custom";

export interface Crate {
  id: ID;
  tenantId: ID;
  brandIds: ID[];
  name: string;
  description: string;
  rarity: CrateRarity;
  /** CSS color used for glow + accents (falls back to rarity default). */
  color?: string;
  /** Weighted prize pool. */
  prizes: CratePrize[];
  /** How a player earns the crate. */
  unlockTrigger: CrateUnlockTrigger;
  /** Max opens per player per day. `null` = unlimited. */
  maxOpensPerDay: number | null;
  /** Expected value shown to operators in the admin list. */
  expectedValue?: number;
  currency: string;
  status: CrateStatus;
  /** Which art preset the CrateCard should render. Defaults to `chest`. */
  artVariant?: CrateArtVariant;
  /**
   * When `artVariant === "custom"`, the URL / data-URL of the uploaded
   * image rendered in place of the built-in variants. Can be any valid
   * `src` — an https URL, a CDN asset, or a base64 data-URL stored at
   * upload time.
   */
  artImageUrl?: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface CrateUnlock {
  id: ID;
  crateId: ID;
  tenantId: ID;
  brandId: ID;
  playerId: string;
  displayName: string;
  country?: string;
  unlockedAt: ISODate;
  openedAt: ISODate | null;
  awardedPrizeId: ID | null;
}

/*
 * -----------------------------------------------------------------------
 * Raffles — ticket-draw promotions
 *
 * Players earn tickets via gameplay (stake milestones, winning streaks,
 * manual operator grants, etc.). At `drawAt`, the platform draws a
 * winner weighted by ticket count. Raffles sit alongside Crate Drops
 * as a parallel gamification lane — Crates reward individual players on
 * their own schedule, Raffles pool everyone into communal drawings.
 * -----------------------------------------------------------------------
 */

export type RafflePrizeType = "cash" | "freespins" | "freebet" | "bonus" | "physical";

export interface RafflePrize {
  id: ID;
  type: RafflePrizeType;
  label: string;
  value: number;
  currency?: string;
  subtitle?: string;
  /** Sort order — position 0 is the grand prize. */
  rank: number;
}

export type RaffleTicketTrigger =
  | { kind: "stake_amount"; perTicket: number; currency: string }
  | { kind: "deposit_amount"; perTicket: number; currency: string }
  | { kind: "spin_count"; perTicket: number }
  | { kind: "manual" };

export type RaffleStatus = "draft" | "live" | "drawing" | "completed" | "archived";

export interface Raffle {
  id: ID;
  tenantId: ID;
  brandIds: ID[];
  name: string;
  description: string;
  status: RaffleStatus;
  currency: string;
  /** CSS color used for accents. */
  color?: string;
  /** Prize pool — position 0 is the grand prize. */
  prizes: RafflePrize[];
  /** How tickets are earned. */
  ticketTrigger: RaffleTicketTrigger;
  /** Max tickets any single player can accumulate. `null` = unlimited. */
  maxTicketsPerPlayer: number | null;
  /** When tickets can start being earned. */
  startsAt: ISODate;
  /** When ticket earning closes. */
  endsAt: ISODate;
  /** When the winner(s) are drawn. */
  drawAt: ISODate;
  /** Cached totals — rebuilt when entries change. */
  totalTickets: number;
  totalPlayers: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface RaffleEntry {
  id: ID;
  raffleId: ID;
  playerId: string;
  displayName: string;
  country?: string;
  ticketCount: number;
  firstEarnedAt: ISODate;
  lastEarnedAt: ISODate;
}

export interface RaffleWinner {
  id: ID;
  raffleId: ID;
  entryId: ID;
  prizeId: ID;
  playerId: string;
  displayName: string;
  country?: string;
  drawnAt: ISODate;
}
