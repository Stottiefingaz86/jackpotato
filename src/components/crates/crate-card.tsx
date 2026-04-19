"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useTransition } from "react";
import {
  Coins,
  Gift,
  Sparkles,
  Dice5,
  Zap,
  Lock,
  Trophy,
  Crown,
} from "lucide-react";
import { ConfettiBurst } from "@/components/effects/confetti-burst";
import { CoinShower } from "@/components/effects/coin-shower";
import { ShineSweep } from "@/components/effects/shine-sweep";
import { cn } from "@/lib/utils";
import type {
  Crate,
  CratePrize,
  CratePrizeType,
  CrateRarity,
} from "@/lib/types";

const RARITY: Record<
  CrateRarity,
  { label: string; from: string; to: string; glow: string; ring: string }
> = {
  common: {
    label: "Common",
    from: "#c97b3f",
    to: "#f4a261",
    glow: "#e8935522",
    ring: "#c97b3f",
  },
  rare: {
    label: "Rare",
    from: "#8a94a8",
    to: "#d8dee9",
    glow: "#9fb0c522",
    ring: "#c0c7d6",
  },
  epic: {
    label: "Epic",
    from: "#d4a017",
    to: "#fde68a",
    glow: "#f6c04233",
    ring: "#f6c042",
  },
  legendary: {
    label: "Legendary",
    from: "#9333ea",
    to: "#ec4899",
    glow: "#a855f744",
    ring: "#d946ef",
  },
  mythic: {
    label: "Mythic",
    from: "#06b6d4",
    to: "#a855f7",
    glow: "#22d3ee55",
    ring: "#22d3ee",
  },
};

const PRIZE_ICON: Record<CratePrizeType, React.ComponentType<{ className?: string }>> = {
  cash: Coins,
  freespins: Sparkles,
  freebet: Dice5,
  bonus: Gift,
  multiplier: Zap,
};

export interface CrateCardProps {
  crate: Crate;
  className?: string;
  /** When true, player has earned this crate and can open it. */
  unlocked?: boolean;
  /** Called after a successful open with the awarded prize. */
  onOpened?: (prize: CratePrize) => void;
  /** Compact layout with no prize-pool breakdown. */
  compact?: boolean;
}

export function CrateCard({
  crate,
  className,
  unlocked = true,
  onOpened,
  compact = false,
}: CrateCardProps) {
  const rarity = RARITY[crate.rarity];
  const color = crate.color ?? rarity.ring;

  const [state, setState] = useState<"idle" | "opening" | "opened">("idle");
  const [prize, setPrize] = useState<CratePrize | null>(null);
  const [, startTransition] = useTransition();

  function open() {
    if (state !== "idle" || !unlocked) return;
    setState("opening");
    startTransition(async () => {
      try {
        const res = await fetch(`/api/crates/${crate.id}/open`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: "Demo player",
            playerId: "plr_demo",
            country: "EU",
          }),
        });
        const data = (await res.json()) as { prize?: CratePrize };
        if (data.prize) {
          // Small delay so the shake animation can complete.
          window.setTimeout(() => {
            setPrize(data.prize!);
            setState("opened");
            onOpened?.(data.prize!);
          }, 900);
        } else {
          setState("idle");
        }
      } catch {
        setState("idle");
      }
    });
  }

  function reset() {
    setState("idle");
    setPrize(null);
  }

  const topWeight = crate.prizes.reduce((s, p) => s + p.weight, 0) || 1;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border p-5 sm:p-6 jp-animated-border",
        className
      )}
      style={{
        borderColor: `${color}33`,
        background:
          "linear-gradient(180deg, oklch(from var(--jp-card) l c h / 94%), oklch(from var(--jp-card-2) l c h / 96%))",
        boxShadow: `0 24px 60px -40px ${color}55, inset 0 1px 0 oklch(1 0 0 / 6%)`,
      }}
    >
      <ShineSweep />

      <div className="relative z-[2] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{
                borderColor: `${color}66`,
                color: color,
                background: `${color}14`,
              }}
            >
              <Crown className="size-3" />
              {rarity.label}
            </span>
            {crate.status !== "live" && (
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {crate.status}
              </span>
            )}
          </div>
          <TriggerPill trigger={crate.unlockTrigger} unlocked={unlocked} />
        </div>

        {/* Crate + title */}
        <div className="flex flex-col items-center gap-3 py-2">
          <CrateArt
            color={color}
            from={rarity.from}
            to={rarity.to}
            state={state}
          />
          <div className="flex flex-col items-center text-center">
            <h3
              className="font-display text-xl sm:text-2xl font-semibold"
              style={{
                background: `linear-gradient(90deg, ${rarity.from}, ${rarity.to})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {crate.name}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              {crate.description}
            </p>
          </div>
        </div>

        {/* Prize pool breakdown */}
        {!compact && (
          <div className="grid gap-1.5">
            {crate.prizes.slice(0, 5).map((p) => {
              const pct = Math.round((p.weight / topWeight) * 100);
              const Icon = PRIZE_ICON[p.type];
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-2.5 py-1.5 text-xs"
                >
                  <Icon className="size-3.5 text-primary shrink-0" />
                  <span className="font-medium truncate flex-1">{p.label}</span>
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={open}
          disabled={state !== "idle" || !unlocked}
          className={cn(
            "group relative mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition-transform shine",
            state === "idle" && unlocked && "hover:scale-[1.02] active:scale-[0.98]",
            state === "opening" && "animate-pulse",
            (!unlocked || state !== "idle") && "opacity-80"
          )}
          style={{
            background: `linear-gradient(90deg, ${rarity.from}, ${rarity.to})`,
            boxShadow: `0 12px 32px -14px ${color}aa, inset 0 1px 0 rgb(255 255 255 / 25%)`,
            textShadow: "0 1px 2px rgb(0 0 0 / 35%)",
            cursor: unlocked ? (state === "idle" ? "pointer" : "default") : "not-allowed",
          }}
        >
          {!unlocked ? (
            <>
              <Lock className="size-4" />
              Locked
            </>
          ) : state === "opening" ? (
            <>
              <Sparkles className="size-4 animate-spin" /> Opening…
            </>
          ) : state === "opened" ? (
            <>
              <Trophy className="size-4" /> Open again
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Unlock crate
            </>
          )}
        </button>
      </div>

      {/* Reveal overlay */}
      <AnimatePresence>
        {state === "opened" && prize && (
          <motion.button
            type="button"
            onClick={reset}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[5] grid place-items-center rounded-[inherit] cursor-pointer"
            style={{
              background:
                "radial-gradient(closest-side, oklch(0 0 0 / 55%), oklch(0 0 0 / 85%))",
              backdropFilter: "blur(8px)",
            }}
          >
            <PrizeReveal prize={prize} color={color} rarity={crate.rarity} />
          </motion.button>
        )}
      </AnimatePresence>

      <ConfettiBurst
        trigger={state === "opened" ? `${crate.id}-${prize?.id}` : null}
        intensity={crate.rarity === "legendary" || crate.rarity === "mythic" ? 1.6 : 1}
      />
      <CoinShower
        trigger={state === "opened" ? `${crate.id}-${prize?.id}` : null}
        count={crate.rarity === "legendary" || crate.rarity === "mythic" ? 40 : 24}
      />
    </div>
  );
}

function TriggerPill({
  trigger,
  unlocked,
}: {
  trigger: Crate["unlockTrigger"];
  unlocked: boolean;
}) {
  const text = (() => {
    switch (trigger.kind) {
      case "stake_amount":
        return `Bet ${trigger.currency} ${trigger.threshold}+`;
      case "spin_count":
        return `${trigger.count} spins`;
      case "win_streak":
        return `${trigger.streak}-win streak`;
      case "daily_login":
        return "Daily login";
      case "manual":
        return "VIP only";
    }
  })();
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest"
      style={{
        borderColor: "var(--border)",
        color: unlocked ? "oklch(0.84 0.19 85)" : "var(--muted-foreground)",
        background: "oklch(0 0 0 / 30%)",
      }}
    >
      {unlocked ? "Ready" : text}
    </span>
  );
}

/**
 * CSS-art crate. Has two lid panels that split apart + a golden interior glow
 * when transitioning into the "opening" state.
 */
function CrateArt({
  color,
  from,
  to,
  state,
}: {
  color: string;
  from: string;
  to: string;
  state: "idle" | "opening" | "opened";
}) {
  const shake = state === "opening";
  const lidOpen = state === "opening" || state === "opened";
  return (
    <motion.div
      animate={
        shake
          ? {
              rotate: [0, -4, 4, -3, 3, -2, 2, 0],
              x: [0, -3, 3, -2, 2, -1, 1, 0],
            }
          : { rotate: 0, x: 0 }
      }
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="relative size-28 sm:size-32"
      style={{ filter: `drop-shadow(0 16px 30px ${color}55)` }}
    >
      {/* Interior glow */}
      <motion.div
        initial={false}
        animate={{
          opacity: lidOpen ? 1 : 0,
          scale: lidOpen ? 1.6 : 0.9,
        }}
        transition={{ duration: 0.6 }}
        className="absolute inset-[22%] rounded-full"
        style={{
          background: `radial-gradient(closest-side, ${to}, ${from} 60%, transparent 75%)`,
          filter: "blur(10px)",
        }}
      />

      {/* Body */}
      <div
        className="absolute inset-x-[8%] bottom-0 top-[38%] rounded-[14px] border"
        style={{
          background: `linear-gradient(180deg, ${from}ee, ${from}aa)`,
          borderColor: `${to}99`,
          boxShadow: `inset 0 -8px 20px ${from}66, inset 0 2px 0 ${to}99`,
        }}
      />
      {/* Body clasp */}
      <div
        className="absolute left-1/2 top-[38%] h-[18%] w-[14%] -translate-x-1/2 rounded-md border"
        style={{
          background: `linear-gradient(180deg, ${to}, ${from})`,
          borderColor: `${to}bb`,
        }}
      />

      {/* Lid left */}
      <motion.div
        initial={false}
        animate={{
          rotate: lidOpen ? -65 : 0,
          y: lidOpen ? -8 : 0,
          x: lidOpen ? -4 : 0,
        }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
        style={{
          transformOrigin: "bottom right",
          background: `linear-gradient(135deg, ${to}, ${from})`,
          borderColor: `${to}cc`,
          boxShadow: `inset 0 2px 0 ${to}`,
        }}
        className="absolute left-[8%] top-[14%] h-[30%] w-[42%] rounded-tl-[14px] rounded-tr-sm border"
      />
      {/* Lid right */}
      <motion.div
        initial={false}
        animate={{
          rotate: lidOpen ? 65 : 0,
          y: lidOpen ? -8 : 0,
          x: lidOpen ? 4 : 0,
        }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
        style={{
          transformOrigin: "bottom left",
          background: `linear-gradient(225deg, ${to}, ${from})`,
          borderColor: `${to}cc`,
          boxShadow: `inset 0 2px 0 ${to}`,
        }}
        className="absolute right-[8%] top-[14%] h-[30%] w-[42%] rounded-tr-[14px] rounded-tl-sm border"
      />
    </motion.div>
  );
}

function PrizeReveal({
  prize,
  color,
  rarity,
}: {
  prize: CratePrize;
  color: string;
  rarity: CrateRarity;
}) {
  const Icon = PRIZE_ICON[prize.type];
  return (
    <motion.div
      initial={{ scale: 0.6, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="flex flex-col items-center gap-3 px-6 py-5 rounded-3xl border"
      style={{
        borderColor: `${color}80`,
        background:
          "linear-gradient(180deg, oklch(0.22 0.04 280 / 95%), oklch(0.14 0.02 275 / 95%))",
        boxShadow: `0 0 80px ${color}66`,
      }}
    >
      <span
        className="text-[10px] uppercase tracking-[0.3em]"
        style={{ color }}
      >
        {RARITY[rarity].label} reward
      </span>
      <div
        className="grid size-16 place-items-center rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${color}66, ${color}22)`,
          boxShadow: `inset 0 0 0 1px ${color}aa`,
        }}
      >
        <Icon className="size-8" style={{ color }} />
      </div>
      <div className="text-center">
        <div
          className="font-display text-2xl sm:text-3xl font-semibold leading-tight"
          style={{ color: "white", textShadow: `0 0 20px ${color}99` }}
        >
          {prize.label}
        </div>
        {prize.subtitle && (
          <div className="text-xs text-muted-foreground mt-1">
            {prize.subtitle}
          </div>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground">
        Tap anywhere to continue
      </span>
    </motion.div>
  );
}
