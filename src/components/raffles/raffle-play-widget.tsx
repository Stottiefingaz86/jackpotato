"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Ticket,
  Sparkles,
  Trophy,
  Dices,
  RotateCcw,
  PartyPopper,
} from "lucide-react";
import { ConfettiBurst } from "@/components/effects/confetti-burst";
import { cn } from "@/lib/utils";

/**
 * Interactive raffle demo that lives inside the marketing page.
 *
 * The flow intentionally mirrors the real raffle loop:
 *   1. Player earns tickets (we surface this as a free "Spin" button — each
 *      spin mints a random ticket number).
 *   2. When the draw window closes, an operator fires the draw, which picks
 *      a single random number.
 *   3. If any of the player's tickets matches the drawn number, they win.
 *
 * All state is client-side and ephemeral — this is a marketing demo, not
 * the real server-side draw. Tickets and winning numbers are 3-digit so the
 * odds feel lottery-authentic while still making a win reachable within a
 * few tries. We also seed the "ticket spinner" with weighted overlap so
 * curious visitors can actually hit a match without grinding for an hour.
 */

const TICKET_MIN = 100;
const TICKET_MAX = 999;
const MAX_TICKETS = 8;

type Status = "idle" | "spinning" | "drawing" | "won" | "lost";

interface Ticketed {
  id: string;
  number: number;
}

function randomTicket() {
  return (
    TICKET_MIN + Math.floor(Math.random() * (TICKET_MAX - TICKET_MIN + 1))
  );
}

function pad3(n: number) {
  return n.toString().padStart(3, "0");
}

export function RafflePlayWidget({
  title = "Try the draw",
  subtitle = "Spin for tickets, then hit Draw. A match = a win.",
  accent = "#a855f7",
  prizeLabel = "€2,500",
  prizeSubtitle = "Grand prize · Weekend raffle",
  className,
}: {
  title?: string;
  subtitle?: string;
  accent?: string;
  prizeLabel?: string;
  prizeSubtitle?: string;
  className?: string;
}) {
  const [tickets, setTickets] = useState<Ticketed[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [rollingNumber, setRollingNumber] = useState<number>(0);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [winningTicketId, setWinningTicketId] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState<number | null>(null);
  const [drawAttempts, setDrawAttempts] = useState(0);
  const timers = useRef<number[]>([]);

  // Clear any pending rollers on unmount so state updates don't leak after
  // the component is gone (happens if a visitor navigates away mid-animation).
  useEffect(() => {
    const handles = timers.current;
    return () => {
      handles.forEach((id) => window.clearInterval(id));
      handles.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  function clearTimers() {
    timers.current.forEach((id) => window.clearInterval(id));
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function spinForTicket() {
    if (status === "spinning" || status === "drawing") return;
    if (tickets.length >= MAX_TICKETS) return;
    clearTimers();

    // Quick, celebratory drop-in — no number roll. We briefly show the
    // "minting" state on the button, then the final ticket appears in the
    // next empty slot via the spring animation on the tile itself.
    setStatus("spinning");
    const settle = window.setTimeout(() => {
      const finalNum = randomTicket();
      setTickets((arr) => [
        ...arr,
        { id: `t_${Date.now()}_${finalNum}`, number: finalNum },
      ]);
      setStatus("idle");
    }, 350);
    timers.current.push(settle);
  }

  function drawWinner() {
    if (status === "spinning" || status === "drawing") return;
    if (tickets.length === 0) return;
    clearTimers();

    setStatus("drawing");
    setWinningNumber(null);
    setWinningTicketId(null);

    // After a handful of empty draws, nudge the odds so the demo actually
    // lands on a win. Real server-side draws are deterministic and fair —
    // this is purely a marketing sweetener so visitors get to feel the
    // celebration state on the landing page.
    const biasForWin = drawAttempts >= 2 && Math.random() < 0.7;
    const target = biasForWin
      ? tickets[Math.floor(Math.random() * tickets.length)].number
      : randomTicket();

    const rollerInterval = window.setInterval(() => {
      setRollingNumber(randomTicket());
    }, 45);
    timers.current.push(rollerInterval);

    const settle = window.setTimeout(() => {
      window.clearInterval(rollerInterval);
      setRollingNumber(target);
      setWinningNumber(target);

      const match = tickets.find((t) => t.number === target);
      if (match) {
        setWinningTicketId(match.id);
        setStatus("won");
        setConfettiKey(Date.now());
      } else {
        setStatus("lost");
      }
      setDrawAttempts((n) => n + 1);
    }, 1500);
    timers.current.push(settle);
  }

  function reset() {
    clearTimers();
    setTickets([]);
    setWinningNumber(null);
    setWinningTicketId(null);
    setStatus("idle");
    setDrawAttempts(0);
  }

  const busy = status === "spinning" || status === "drawing";
  const canDraw = tickets.length > 0 && !busy;
  const canSpin = tickets.length < MAX_TICKETS && !busy;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border p-6 sm:p-7",
        className
      )}
      style={{
        borderColor: `${accent}55`,
        background:
          "linear-gradient(180deg, oklch(0.2 0.025 275) 0%, oklch(0.14 0.022 275) 100%)",
        boxShadow: `0 24px 60px -40px ${accent}88, inset 0 1px 0 rgb(255 255 255 / 6%)`,
      }}
    >
      {/* Ambient accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full blur-3xl opacity-40"
        style={{
          background: `radial-gradient(circle, ${accent}55, transparent 70%)`,
        }}
      />

      <div className="relative z-[2] flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="inline-flex size-9 shrink-0 place-items-center rounded-full"
              style={{
                background: `linear-gradient(135deg, ${accent}, #ec4899)`,
              }}
            >
              <Ticket className="size-4 m-auto text-black/80" />
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-lg font-semibold truncate">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {subtitle}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-[10px] uppercase tracking-[0.22em]"
              style={{ color: accent }}
            >
              Prize
            </div>
            <div className="font-display text-base font-semibold">
              {prizeLabel}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {prizeSubtitle}
            </div>
          </div>
        </div>

        {/* Winning number display */}
        <div
          className="relative overflow-hidden rounded-2xl border p-4 text-center"
          style={{
            borderColor: `${accent}44`,
            background:
              "linear-gradient(180deg, rgb(255 255 255 / 4%), rgb(255 255 255 / 1%))",
          }}
        >
          <div
            className="text-[10px] uppercase tracking-[0.3em] mb-1"
            style={{ color: "rgb(255 255 255 / 55%)" }}
          >
            Winning number
          </div>
          <AnimatePresence mode="wait">
            {status === "drawing" ? (
              <motion.div
                key="drawing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-display text-5xl font-bold tabular leading-none"
                style={{ color: "#fff" }}
              >
                {pad3(rollingNumber)}
              </motion.div>
            ) : winningNumber !== null ? (
              <motion.div
                key={`settled-${winningNumber}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 250, damping: 14 }}
                className="font-display text-5xl font-bold tabular leading-none"
                style={{
                  background: `linear-gradient(90deg, ${accent}, #ec4899)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                  display: "inline-block",
                }}
              >
                {pad3(winningNumber)}
              </motion.div>
            ) : (
              <motion.div
                key="pending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-display text-5xl font-bold tabular leading-none opacity-40"
                style={{ color: "#fff" }}
              >
                — — —
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {status === "won"
              ? "🎉 You match — grand prize claimed"
              : status === "lost"
                ? "No match this round. Spin more tickets and try again."
                : "Pick tickets on the right, then fire the draw."}
          </div>
        </div>

        {/* Tickets wallet */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] uppercase tracking-[0.22em]"
                style={{ color: "rgb(255 255 255 / 55%)" }}
              >
                Your tickets
              </span>
              <span
                className="rounded-full border px-2 py-0.5 text-[10px] tabular"
                style={{
                  borderColor: "rgb(255 255 255 / 15%)",
                  color: "rgb(255 255 255 / 75%)",
                }}
              >
                {tickets.length} / {MAX_TICKETS}
              </span>
            </div>
            {tickets.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition"
              >
                <RotateCcw className="size-3" />
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {Array.from({ length: MAX_TICKETS }).map((_, i) => {
              const t = tickets[i];
              const isNew = t && i === tickets.length - 1;
              const isWinner = t?.id === winningTicketId;
              const isPendingSlot =
                !t && status === "spinning" && i === tickets.length;
              return (
                <motion.div
                  key={t?.id ?? `slot-${i}`}
                  initial={t && isNew ? { scale: 0.5, opacity: 0, y: -8 } : false}
                  animate={
                    t && isNew
                      ? { scale: 1, opacity: 1, y: 0 }
                      : { scale: 1, opacity: 1, y: 0 }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 360,
                    damping: 18,
                  }}
                  className={cn(
                    "relative flex aspect-square items-center justify-center rounded-xl border text-center font-display text-sm font-bold tabular",
                    isWinner && "animate-pulse",
                    isPendingSlot && "animate-pulse"
                  )}
                  style={{
                    borderColor: t
                      ? isWinner
                        ? accent
                        : `${accent}44`
                      : isPendingSlot
                        ? `${accent}66`
                        : "rgb(255 255 255 / 8%)",
                    background: t
                      ? isWinner
                        ? `linear-gradient(135deg, ${accent}aa, #ec489988)`
                        : `linear-gradient(135deg, ${accent}22, transparent)`
                      : isPendingSlot
                        ? `linear-gradient(135deg, ${accent}11, transparent)`
                        : "rgb(255 255 255 / 2%)",
                    color: t ? "#fff" : "rgb(255 255 255 / 30%)",
                    boxShadow: isWinner
                      ? `0 0 0 1px ${accent}, 0 0 20px ${accent}99`
                      : undefined,
                  }}
                >
                  {t ? (
                    <span>{pad3(t.number)}</span>
                  ) : (
                    <Ticket
                      className={cn(
                        "size-3.5",
                        isPendingSlot ? "opacity-80" : "opacity-40"
                      )}
                      style={isPendingSlot ? { color: accent } : undefined}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={spinForTicket}
            disabled={!canSpin}
            className={cn(
              "group relative inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition-transform shine",
              canSpin && "hover:scale-[1.02] active:scale-[0.98]",
              !canSpin && "opacity-60"
            )}
            style={{
              background: `linear-gradient(90deg, ${accent}, #ec4899)`,
              boxShadow: `0 12px 32px -14px ${accent}aa, inset 0 1px 0 rgb(255 255 255 / 25%)`,
              textShadow: "0 1px 2px rgb(0 0 0 / 35%)",
              cursor: canSpin ? "pointer" : "not-allowed",
            }}
          >
            {status === "spinning" ? (
              <>
                <Sparkles className="size-4 animate-spin" />
                Minting…
              </>
            ) : tickets.length >= MAX_TICKETS ? (
              <>
                <Ticket className="size-4" />
                Wallet full
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Spin for a ticket
              </>
            )}
          </button>
          <button
            type="button"
            onClick={drawWinner}
            disabled={!canDraw}
            className={cn(
              "group relative inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-transform",
              canDraw && "hover:scale-[1.02] active:scale-[0.98]",
              !canDraw && "opacity-60"
            )}
            style={{
              borderColor: `${accent}66`,
              color: "#fff",
              background:
                "linear-gradient(180deg, rgb(255 255 255 / 6%), rgb(255 255 255 / 2%))",
              cursor: canDraw ? "pointer" : "not-allowed",
            }}
          >
            {status === "drawing" ? (
              <>
                <Dices className="size-4 animate-spin" />
                Drawing…
              </>
            ) : (
              <>
                <Dices className="size-4" />
                Draw winner
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reveal overlay on win */}
      <AnimatePresence>
        {status === "won" && winningNumber !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[5] grid place-items-center cursor-pointer"
            style={{
              background:
                "radial-gradient(closest-side, oklch(0 0 0 / 55%), oklch(0 0 0 / 85%))",
              backdropFilter: "blur(6px)",
            }}
            onClick={reset}
          >
            <motion.div
              initial={{ scale: 0.6, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="flex flex-col items-center gap-3 px-6 py-5 rounded-3xl border"
              style={{
                borderColor: `${accent}aa`,
                background:
                  "linear-gradient(180deg, oklch(0.22 0.04 280 / 95%), oklch(0.14 0.02 275 / 95%))",
                boxShadow: `0 0 80px ${accent}88`,
              }}
            >
              <span
                className="text-[10px] uppercase tracking-[0.3em]"
                style={{ color: accent }}
              >
                Winning ticket
              </span>
              <div
                className="grid size-16 place-items-center rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${accent}66, ${accent}22)`,
                  boxShadow: `inset 0 0 0 1px ${accent}aa`,
                }}
              >
                <Trophy className="size-8" style={{ color: accent }} />
              </div>
              <div className="text-center">
                <div
                  className="font-display text-3xl font-semibold leading-tight"
                  style={{ color: "white", textShadow: `0 0 20px ${accent}aa` }}
                >
                  {prizeLabel}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Ticket #{pad3(winningNumber)} · tap to play again
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <PartyPopper className="size-3" />
                That&apos;s how the real draw feels.
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfettiBurst trigger={confettiKey} intensity={1.4} />
    </div>
  );
}
