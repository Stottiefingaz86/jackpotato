import type { RealtimeEvent } from "@/lib/types";

/**
 * Tiny in-process pub/sub for realtime events. One bus per Node process is
 * fine for the showcase; wire to Redis/Pubsub later.
 */
type Listener = (event: RealtimeEvent) => void;

class EventBus {
  private listeners = new Set<Listener>();
  private history: RealtimeEvent[] = [];
  private readonly historyCap = 200;

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  publish(event: RealtimeEvent) {
    this.history.push(event);
    if (this.history.length > this.historyCap) {
      this.history.splice(0, this.history.length - this.historyCap);
    }
    for (const l of this.listeners) {
      try {
        l(event);
      } catch {
        // ignore listener errors
      }
    }
  }

  recent(limit = 50) {
    return this.history.slice(-limit).reverse();
  }
}

const g = globalThis as unknown as { __jpBus?: EventBus };
if (!g.__jpBus) g.__jpBus = new EventBus();
export const bus = g.__jpBus;
