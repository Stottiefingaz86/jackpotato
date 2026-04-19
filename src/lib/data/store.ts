import type {
  ApiKey,
  AuditLog,
  BetEvent,
  Brand,
  ContributionEvent,
  Crate,
  CrateUnlock,
  EligibleGame,
  JackpotCampaign,
  JackpotTier,
  JackpotWin,
  Tenant,
  TenantMembership,
  User,
  Widget,
  WidgetPlacement,
  WidgetTheme,
} from "@/lib/types";
import {
  seedApiKeys,
  seedBrands,
  seedCampaigns,
  seedCrates,
  seedCrateUnlocks,
  seedEligibleGames,
  seedMemberships,
  seedPlacements,
  seedTenants,
  seedThemes,
  seedTiers,
  seedUsers,
  seedWidgets,
  seedWinners,
} from "@/lib/data/seed";

/**
 * In-memory domain store. HMR-safe via a globalThis cache so data survives
 * module reloads during `next dev`. The shape mirrors the spec's data model
 * so it can be swapped for a Prisma-backed repo later.
 */
export interface Store {
  tenants: Tenant[];
  users: User[];
  memberships: TenantMembership[];
  brands: Brand[];
  themes: WidgetTheme[];
  campaigns: JackpotCampaign[];
  tiers: JackpotTier[];
  eligibleGames: EligibleGame[];
  widgets: Widget[];
  placements: WidgetPlacement[];
  apiKeys: ApiKey[];
  winners: JackpotWin[];
  crates: Crate[];
  crateUnlocks: CrateUnlock[];
  betEvents: BetEvent[];
  contributions: ContributionEvent[];
  auditLogs: AuditLog[];
  /** When `true`, the sandbox simulator is ticking. */
  simulatorRunning: boolean;
  /** Simulator tick speed in ms. */
  simulatorIntervalMs: number;
  /** Simulator interval handle (opaque). */
  simulatorHandle?: ReturnType<typeof setInterval>;
}

function initialStore(): Store {
  return {
    tenants: [...seedTenants],
    users: [...seedUsers],
    memberships: [...seedMemberships],
    brands: [...seedBrands],
    themes: [...seedThemes],
    campaigns: [...seedCampaigns],
    tiers: seedTiers.map((t) => ({ ...t })),
    eligibleGames: [...seedEligibleGames],
    widgets: [...seedWidgets],
    placements: [...seedPlacements],
    apiKeys: [...seedApiKeys],
    winners: [...seedWinners],
    crates: seedCrates.map((c) => ({ ...c, prizes: c.prizes.map((p) => ({ ...p })) })),
    crateUnlocks: [...seedCrateUnlocks],
    betEvents: [],
    contributions: [],
    auditLogs: [],
    simulatorRunning: false,
    simulatorIntervalMs: 220,
  };
}

const g = globalThis as unknown as { __jpStore?: Store };
if (!g.__jpStore) g.__jpStore = initialStore();
export const store: Store = g.__jpStore;

// Self-heal: when new collections are added across HMR reloads, make sure the
// persisted global store still exposes them with seeded defaults.
if (!store.crates) {
  store.crates = seedCrates.map((c) => ({
    ...c,
    prizes: c.prizes.map((p) => ({ ...p })),
  }));
}
if (!store.crateUnlocks) {
  store.crateUnlocks = [...seedCrateUnlocks];
}

// Migrate legacy tenant id `tnt_sharedluck` → `tnt_jackpotato` for the demo
// rename. Runs once across HMR because we mutate the persisted singleton.
if (store.tenants.some((t) => t.id === "tnt_sharedluck")) {
  const OLD = "tnt_sharedluck";
  const NEW = "tnt_jackpotato";
  const rewrite = <T extends { tenantId?: string }>(rows: T[]) => {
    for (const r of rows) if (r.tenantId === OLD) r.tenantId = NEW;
  };
  store.tenants = store.tenants.map((t) =>
    t.id === OLD
      ? { ...t, id: NEW, name: "Jackpotato Internal", slug: "jackpotato" }
      : t
  );
  rewrite(store.memberships);
  rewrite(store.brands);
  rewrite(store.themes);
  rewrite(store.campaigns);
  rewrite(store.widgets);
  rewrite(store.placements);
  rewrite(store.apiKeys);
  rewrite(store.crates);
  rewrite(store.auditLogs);
}

// -------- read helpers --------

export function getTenant(id: string) {
  return store.tenants.find((t) => t.id === id);
}

export function getBrand(id: string) {
  return store.brands.find((b) => b.id === id);
}

export function getTheme(id: string) {
  return store.themes.find((t) => t.id === id);
}

export function getCampaign(id: string) {
  return store.campaigns.find((c) => c.id === id);
}

export function getTiersForCampaign(campaignId: string) {
  return store.tiers
    .filter((t) => t.campaignId === campaignId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getWidget(id: string) {
  return store.widgets.find((w) => w.id === id);
}

export function getWinnersForCampaign(campaignId: string, limit = 10) {
  return store.winners
    .filter((w) => w.campaignId === campaignId)
    .slice(0, limit);
}

export function getRecentWinners(limit = 10, tenantId?: string) {
  const items = tenantId
    ? store.winners.filter((w) => w.tenantId === tenantId)
    : store.winners;
  return [...items]
    .sort((a, b) => Date.parse(b.wonAt) - Date.parse(a.wonAt))
    .slice(0, limit);
}

export function getCampaignsForTenant(tenantId: string) {
  return store.campaigns.filter((c) => c.tenantId === tenantId);
}

export function getBrandsForTenant(tenantId: string) {
  return store.brands.filter((b) => b.tenantId === tenantId);
}

export function getThemesForTenant(tenantId: string) {
  return store.themes.filter((t) => t.tenantId === tenantId);
}

export function getWidgetsForTenant(tenantId: string) {
  return store.widgets.filter((w) => w.tenantId === tenantId);
}

export function getApiKeysForTenant(tenantId: string) {
  return store.apiKeys.filter((k) => k.tenantId === tenantId);
}

export function getCratesForTenant(tenantId: string) {
  return store.crates.filter((c) => c.tenantId === tenantId);
}

export function getCrate(id: string) {
  return store.crates.find((c) => c.id === id);
}

export function getCrateUnlocks(crateId: string, limit = 20) {
  return store.crateUnlocks
    .filter((u) => u.crateId === crateId)
    .sort((a, b) => Date.parse(b.unlockedAt) - Date.parse(a.unlockedAt))
    .slice(0, limit);
}

export function crateExpectedValue(crate: Crate): number {
  const totalWeight = crate.prizes.reduce((s, p) => s + p.weight, 0);
  if (totalWeight === 0) return 0;
  return crate.prizes.reduce((sum, p) => {
    const notional =
      p.type === "cash" || p.type === "freebet"
        ? p.value
        : p.type === "freespins"
          ? p.value * 0.25 // assume ~0.25 notional per free spin
          : p.type === "bonus"
            ? p.value * 0.5 // 50% of match amount as EV proxy
            : p.value * 2; // multiplier EV proxy
    return sum + (notional * p.weight) / totalWeight;
  }, 0);
}

export function campaignTotalAmount(campaignId: string) {
  return getTiersForCampaign(campaignId).reduce(
    (sum, t) => sum + t.currentAmount,
    0
  );
}

// -------- utility: ids --------
let _seq = 1000;
export function nextId(prefix: string) {
  _seq += 1;
  return `${prefix}_${_seq.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}
