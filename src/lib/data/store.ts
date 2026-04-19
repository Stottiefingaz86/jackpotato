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
  Raffle,
  RaffleEntry,
  RaffleWinner,
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
  seedRaffles,
  seedRaffleEntries,
  seedRaffleWinners,
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
  raffles: Raffle[];
  raffleEntries: RaffleEntry[];
  raffleWinners: RaffleWinner[];
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
    raffles: seedRaffles.map((r) => ({ ...r, prizes: r.prizes.map((p) => ({ ...p })) })),
    raffleEntries: [...seedRaffleEntries],
    raffleWinners: [...seedRaffleWinners],
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
if (!store.raffles) {
  store.raffles = seedRaffles.map((r) => ({
    ...r,
    prizes: r.prizes.map((p) => ({ ...p })),
  }));
}
if (!store.raffleEntries) store.raffleEntries = [...seedRaffleEntries];
if (!store.raffleWinners) store.raffleWinners = [...seedRaffleWinners];

// Merge any newly-seeded raffles into the persisted store so new demo entries
// show up after HMR reloads without blowing away operator-created ones.
{
  const existingRaffles = new Set(store.raffles.map((r) => r.id));
  for (const r of seedRaffles) {
    if (!existingRaffles.has(r.id)) {
      store.raffles.push({ ...r, prizes: r.prizes.map((p) => ({ ...p })) });
    }
  }
}

// Merge any newly-seeded themes/widgets into the persisted store without
// blowing away user-created entries. Runs on every HMR tick so the catalog
// stays fresh as we expand the showcase.
{
  const existingThemes = new Set(store.themes.map((t) => t.id));
  for (const t of seedThemes) {
    if (!existingThemes.has(t.id)) store.themes.push(t);
  }
  const existingWidgets = new Set(store.widgets.map((w) => w.id));
  for (const w of seedWidgets) {
    if (!existingWidgets.has(w.id)) store.widgets.push(w);
  }
}

// Migrate legacy tenant ids (`tnt_sharedluck` → `tnt_jackpotato` → `tnt_turbopot`)
// for the product renames. Runs across HMR because we mutate the persisted
// singleton — so hot-reloading never leaves you with a dead tenant id.
{
  const RENAMES: Array<{ from: string; to: string; name: string; slug: string }> = [
    { from: "tnt_sharedluck", to: "tnt_turbopot", name: "TurboPot Internal", slug: "turbopot" },
    { from: "tnt_jackpotato", to: "tnt_turbopot", name: "TurboPot Internal", slug: "turbopot" },
  ];
  for (const r of RENAMES) {
    if (!store.tenants.some((t) => t.id === r.from)) continue;
    const rewrite = <T extends { tenantId?: string }>(rows: T[]) => {
      for (const row of rows) if (row.tenantId === r.from) row.tenantId = r.to;
    };
    // If both the old and new tenant rows exist side by side, drop the old one
    // so the switcher doesn't show duplicates after the migration.
    const hasNew = store.tenants.some((t) => t.id === r.to);
    store.tenants = store.tenants
      .map((t) =>
        t.id === r.from
          ? hasNew
            ? null
            : { ...t, id: r.to, name: r.name, slug: r.slug }
          : t
      )
      .filter((t): t is NonNullable<typeof t> => t !== null);
    rewrite(store.memberships);
    rewrite(store.brands);
    rewrite(store.themes);
    rewrite(store.campaigns);
    rewrite(store.widgets);
    rewrite(store.apiKeys);
    rewrite(store.crates);
    rewrite(store.raffles);
    rewrite(store.auditLogs);
  }
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

export function getRafflesForTenant(tenantId: string) {
  return store.raffles.filter((r) => r.tenantId === tenantId);
}

export function getRaffle(id: string) {
  return store.raffles.find((r) => r.id === id);
}

export function getRaffleEntries(raffleId: string) {
  return [...store.raffleEntries]
    .filter((e) => e.raffleId === raffleId)
    .sort((a, b) => b.ticketCount - a.ticketCount);
}

export function getRaffleWinners(raffleId: string) {
  return store.raffleWinners.filter((w) => w.raffleId === raffleId);
}

export function rafflePrizePoolValue(raffle: Raffle): number {
  return raffle.prizes.reduce((s, p) => {
    const notional =
      p.type === "cash" || p.type === "freebet" || p.type === "physical"
        ? p.value
        : p.type === "freespins"
          ? p.value * 0.25
          : p.value * 2;
    return s + notional;
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
