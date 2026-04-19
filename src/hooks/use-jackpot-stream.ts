"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { RealtimeEvent } from "@/lib/types";

export interface JackpotStreamSnapshot {
  /** tierId -> currentAmount */
  tiers: Record<string, number>;
  /** last `jackpot.won` events, newest first */
  recentWins: Extract<RealtimeEvent, { type: "jackpot.won" }>[];
  /** last raw events, newest first */
  recentEvents: RealtimeEvent[];
  /** increments whenever any tier amount updates; useful as an animation key */
  updateCount: number;
  /** increments whenever a jackpot.won event arrives */
  winCount: number;
  /** true once the SSE connection has delivered the hello packet */
  connected: boolean;
}

const initialSnapshot: JackpotStreamSnapshot = {
  tiers: {},
  recentWins: [],
  recentEvents: [],
  updateCount: 0,
  winCount: 0,
  connected: false,
};

/**
 * Shared, reference-counted SSE singleton.
 *
 * Previous impl created one EventSource per `useJackpotStream()` call, which
 * meant a page with 4-5 live widgets would blow through Chrome's 6-per-origin
 * connection limit and starve out HMR / page fetches. This module keeps one
 * connection per browser tab and fans events out to every subscriber.
 */
type Subscriber = () => void;

type Store = {
  snapshot: JackpotStreamSnapshot;
  subscribers: Set<Subscriber>;
  es: EventSource | null;
  refCount: number;
};

const g = globalThis as unknown as { __jpStreamStore?: Store };
function getStore(): Store {
  if (!g.__jpStreamStore) {
    g.__jpStreamStore = {
      snapshot: initialSnapshot,
      subscribers: new Set(),
      es: null,
      refCount: 0,
    };
  }
  return g.__jpStreamStore;
}

function emit() {
  const store = getStore();
  for (const s of store.subscribers) s();
}

function update(updater: (s: JackpotStreamSnapshot) => JackpotStreamSnapshot) {
  const store = getStore();
  store.snapshot = updater(store.snapshot);
  emit();
}

function handleMessage(msg: MessageEvent<string>) {
  let evt: RealtimeEvent | { type: "hello" };
  try {
    evt = JSON.parse(msg.data);
  } catch {
    return;
  }
  if ((evt as { type: string }).type === "hello") {
    update((s) => ({ ...s, connected: true }));
    return;
  }
  update((s) => {
    const next: JackpotStreamSnapshot = {
      ...s,
      recentEvents: [evt as RealtimeEvent, ...s.recentEvents].slice(0, 60),
    };
    if ((evt as RealtimeEvent).type === "jackpot.updated") {
      const e = evt as Extract<RealtimeEvent, { type: "jackpot.updated" }>;
      next.tiers = { ...s.tiers, [e.tierId]: e.currentAmount };
      next.updateCount = s.updateCount + 1;
    } else if ((evt as RealtimeEvent).type === "jackpot.won") {
      const e = evt as Extract<RealtimeEvent, { type: "jackpot.won" }>;
      next.recentWins = [e, ...s.recentWins].slice(0, 30);
      next.winCount = s.winCount + 1;
    }
    return next;
  });
}

function ensureConnection() {
  const store = getStore();
  if (store.es) return;
  if (typeof window === "undefined") return;
  const es = new EventSource("/api/stream/jackpots");
  es.onmessage = handleMessage;
  es.onerror = () => {
    // Let EventSource auto-reconnect; nothing to do.
  };
  store.es = es;
}

function closeConnection() {
  const store = getStore();
  if (!store.es) return;
  store.es.close();
  store.es = null;
  // Reset `connected` so widgets show the right status on remount.
  store.snapshot = { ...store.snapshot, connected: false };
  emit();
}

function subscribe(cb: Subscriber): () => void {
  const store = getStore();
  store.subscribers.add(cb);
  store.refCount += 1;
  ensureConnection();
  return () => {
    store.subscribers.delete(cb);
    store.refCount -= 1;
    // Defer closing so rapid remounts (StrictMode, nav) don't thrash the
    // connection. If nothing has resubscribed within a tick, close.
    if (store.refCount <= 0) {
      const currentRef = store.refCount;
      setTimeout(() => {
        const s = getStore();
        if (s.refCount <= currentRef && s.refCount <= 0) closeConnection();
      }, 250);
    }
  };
}

function getSnapshot(): JackpotStreamSnapshot {
  return getStore().snapshot;
}

function getServerSnapshot(): JackpotStreamSnapshot {
  return initialSnapshot;
}

/**
 * Subscribes to /api/stream/jackpots. All calls within a tab share a single
 * underlying EventSource.
 */
export function useJackpotStream() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const getTier = useCallback(
    (tierId: string, fallback = 0) => snap.tiers[tierId] ?? fallback,
    [snap.tiers]
  );

  return { ...snap, getTier };
}
