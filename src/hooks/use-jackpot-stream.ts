"use client";

import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";
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
 * One EventSource per tab, shared by every subscriber. Prevents widgets from
 * blowing through Chrome's 6-per-origin connection cap.
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

/**
 * The simulator fires 25-70 events per second, which would cause React to
 * re-render live widgets ~50x per second. We coalesce the intermediate
 * snapshots so the UI only sees one update per animation frame (~60Hz max).
 *
 * `store.snapshot` is still mutated synchronously so slice hooks reading the
 * latest value stay correct; we just defer the subscriber notifications.
 */
let flushScheduled = false;
function scheduleEmit() {
  if (flushScheduled) return;
  flushScheduled = true;
  const run = () => {
    flushScheduled = false;
    emit();
  };
  if (typeof window !== "undefined" && window.requestAnimationFrame) {
    window.requestAnimationFrame(run);
  } else {
    setTimeout(run, 16);
  }
}

function update(updater: (s: JackpotStreamSnapshot) => JackpotStreamSnapshot) {
  const store = getStore();
  store.snapshot = updater(store.snapshot);
  scheduleEmit();
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
 * underlying EventSource. Re-renders on every SSE event — use the specific
 * slice hooks below for hot-path components like LiveBalanceCard.
 */
export function useJackpotStream() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const getTier = useCallback(
    (tierId: string, fallback = 0) => snap.tiers[tierId] ?? fallback,
    [snap.tiers]
  );

  return { ...snap, getTier };
}

// ---------- Selector slice hooks ----------
// These subscribe to the same singleton but only cause React re-renders when
// their specific slice of state changes, not on every SSE tick. Crucial for
// admin pages that render many live widgets at once.

/**
 * Subscribe to a derived value of the snapshot. The selector must be a stable
 * reference (wrapped in useCallback/useMemo) and pure — no mutations. The
 * `isEqual` function lets us return the cached value when the new slice is
 * shallow-equal to the previous one, avoiding the "new object every tick"
 * trap that would otherwise defeat React's bailout.
 */
function useSlice<T>(
  selector: (s: JackpotStreamSnapshot) => T,
  isEqual: (a: T, b: T) => boolean = Object.is
): T {
  // Client snapshot cache — keyed by the snapshot reference so we only
  // recompute the slice when the underlying store actually ticked.
  const clientCacheRef = useRef<{
    snap: JackpotStreamSnapshot | null;
    value: T;
  } | null>(null);

  // Server snapshot cache — computed lazily, reused forever. React requires
  // getServerSnapshot to return a stable reference across calls.
  const serverCacheRef = useRef<{ value: T } | null>(null);

  const getSliceSnapshot = useCallback((): T => {
    const snap = getStore().snapshot;
    let cache = clientCacheRef.current;
    if (cache === null) {
      cache = { snap, value: selector(snap) };
      clientCacheRef.current = cache;
      return cache.value;
    }
    if (cache.snap === snap) return cache.value;
    const next = selector(snap);
    if (isEqual(cache.value, next)) {
      cache.snap = snap;
      return cache.value;
    }
    cache.snap = snap;
    cache.value = next;
    return next;
  }, [selector, isEqual]);

  const getServerSliceSnapshot = useCallback((): T => {
    if (serverCacheRef.current === null) {
      serverCacheRef.current = { value: selector(initialSnapshot) };
    }
    return serverCacheRef.current.value;
  }, [selector]);

  return useSyncExternalStore(subscribe, getSliceSnapshot, getServerSliceSnapshot);
}

/** Join a stable string key for a list of tier ids so we can dep-memo cheaply. */
function joinIds(ids: readonly string[]): string {
  return [...ids].sort().join("|");
}

/** Current amounts for the specified tier IDs. Stable ref while values match. */
export function useJackpotTiers(
  tierIds: readonly string[]
): Record<string, number | undefined> {
  const key = useMemo(() => joinIds(tierIds), [tierIds]);
  const idList = useMemo(() => (key ? key.split("|") : []), [key]);

  const selector = useCallback(
    (s: JackpotStreamSnapshot) => {
      const out: Record<string, number | undefined> = {};
      for (const id of idList) out[id] = s.tiers[id];
      return out;
    },
    [idList]
  );

  const isEqual = useCallback(
    (
      a: Record<string, number | undefined>,
      b: Record<string, number | undefined>
    ) => {
      for (const id of idList) if (a[id] !== b[id]) return false;
      return true;
    },
    [idList]
  );

  return useSlice(selector, isEqual);
}

/** Most recent `jackpot.won` event for a given campaign + tier set. */
export function useJackpotLatestWin(
  campaignId: string,
  tierIds: readonly string[]
): Extract<RealtimeEvent, { type: "jackpot.won" }> | undefined {
  const key = useMemo(() => joinIds(tierIds), [tierIds]);
  const idSet = useMemo(() => new Set(key ? key.split("|") : []), [key]);

  const selector = useCallback(
    (s: JackpotStreamSnapshot) =>
      s.recentWins.find(
        (w) => w.campaignId === campaignId && idSet.has(w.tierId)
      ),
    [campaignId, idSet]
  );

  // Compare by timestamp+tierId so we don't re-render on unrelated wins.
  const isEqual = useCallback(
    (
      a: Extract<RealtimeEvent, { type: "jackpot.won" }> | undefined,
      b: Extract<RealtimeEvent, { type: "jackpot.won" }> | undefined
    ) => {
      if (a === b) return true;
      if (!a || !b) return false;
      return a.timestamp === b.timestamp && a.tierId === b.tierId;
    },
    []
  );

  return useSlice(selector, isEqual);
}

export function useJackpotConnected(): boolean {
  const selector = useCallback((s: JackpotStreamSnapshot) => s.connected, []);
  return useSlice(selector);
}
