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
  | "must_drop_meter"
  | "winner_ticker"
  | "game_badge";

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
  tickerMode?: "ticker" | "toast";
  showFlag?: boolean;
  anonymize?: boolean;
  autoRotateSpeed?: number;
  maxItems?: number;
  badgeText?: string;
  showAmount?: boolean;
  clickDestination?: string;
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
