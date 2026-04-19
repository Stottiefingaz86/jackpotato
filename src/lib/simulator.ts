import { store } from "@/lib/data/store";
import { ingestBetEvent } from "@/lib/engine";

const GAME_POOL = [
  { gameId: "slot_book_of_gold", gameGroup: "slots", provider: "Relax" },
  { gameId: "slot_starburst", gameGroup: "slots", provider: "NetEnt" },
  { gameId: "slot_sweet_bonanza", gameGroup: "slots", provider: "Pragmatic" },
  {
    gameId: "slot_gates_of_olympus",
    gameGroup: "slots",
    provider: "Pragmatic",
  },
  { gameId: "slot_neon_city", gameGroup: "slots", provider: "Nolimit" },
  { gameId: "slot_crypto_rush", gameGroup: "slots", provider: "Hacksaw" },
  { gameId: "live_blackjack_vip", gameGroup: "live_casino", provider: "Evolution" },
  { gameId: "live_roulette_imm", gameGroup: "live_casino", provider: "Evolution" },
];

function randomStake(): number {
  const choices = [0.2, 0.5, 1, 1.5, 2, 3, 5, 7.5, 10, 20, 50];
  return choices[Math.floor(Math.random() * choices.length)];
}

function tickOnce() {
  const activeCampaigns = store.campaigns.filter((c) => c.status === "active");
  if (activeCampaigns.length === 0) return;
  const campaign =
    activeCampaigns[Math.floor(Math.random() * activeCampaigns.length)];
  const brandId =
    campaign.brandIds[Math.floor(Math.random() * campaign.brandIds.length)];
  const game = GAME_POOL[Math.floor(Math.random() * GAME_POOL.length)];
  const playerId = `sim_${Math.floor(Math.random() * 90000 + 10000)}`;

  ingestBetEvent({
    tenantId: campaign.tenantId,
    brandId,
    playerId,
    gameId: game.gameId,
    gameGroup: game.gameGroup,
    stakeAmount: randomStake(),
    currency: campaign.currency,
  });
}

export function startSimulator(intervalMs?: number) {
  if (store.simulatorRunning) return;
  if (intervalMs) store.simulatorIntervalMs = intervalMs;
  store.simulatorRunning = true;
  store.simulatorHandle = setInterval(() => {
    // Burst of 1-3 contributions per tick for lively motion.
    const burst = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < burst; i++) tickOnce();
  }, store.simulatorIntervalMs);
}

export function stopSimulator() {
  if (!store.simulatorRunning) return;
  store.simulatorRunning = false;
  if (store.simulatorHandle) {
    clearInterval(store.simulatorHandle);
    store.simulatorHandle = undefined;
  }
}

export function setSimulatorSpeed(ms: number) {
  store.simulatorIntervalMs = Math.max(50, Math.min(2000, ms));
  if (store.simulatorRunning) {
    stopSimulator();
    startSimulator();
  }
}

/** Kick off the sim automatically once per process so the showcase is alive. */
export function ensureSimulatorAutoStart() {
  if (!store.simulatorRunning) startSimulator();
}
