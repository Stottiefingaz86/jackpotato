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
  CrateArtVariant,
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

const PRIZE_ICON: Record<CratePrizeType, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
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
  /**
   * When true, skip the /api call and roll a prize from the local weights.
   * Used by the admin crate editor preview so operators can feel the open
   * flow before saving a crate to the store.
   */
  localSimulation?: boolean;
}

export function CrateCard({
  crate,
  className,
  unlocked = true,
  onOpened,
  compact = false,
  localSimulation = false,
}: CrateCardProps) {
  const rarity = RARITY[crate.rarity];
  const color = crate.color ?? rarity.ring;

  const [state, setState] = useState<"idle" | "opening" | "opened">("idle");
  const [prize, setPrize] = useState<CratePrize | null>(null);
  const [, startTransition] = useTransition();

  function pickLocalPrize(): CratePrize | null {
    if (crate.prizes.length === 0) return null;
    const total = crate.prizes.reduce((s, p) => s + p.weight, 0);
    if (total <= 0) return crate.prizes[0];
    let roll = Math.random() * total;
    for (const p of crate.prizes) {
      roll -= p.weight;
      if (roll <= 0) return p;
    }
    return crate.prizes[crate.prizes.length - 1];
  }

  function open() {
    if (state !== "idle" || !unlocked) return;
    setState("opening");
    if (localSimulation) {
      // Editor preview: roll the dice client-side so the operator doesn't
      // need to save a crate to feel the open flow.
      const picked = pickLocalPrize();
      window.setTimeout(() => {
        if (picked) {
          setPrize(picked);
          setState("opened");
          onOpened?.(picked);
        } else {
          setState("idle");
        }
      }, 900);
      return;
    }
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
        // Fixed dark card background so rarity colors only appear on the crate
        // art + CTA + title — NOT the whole card. Using static oklch values
        // avoids the `oklch(from ...)` relative syntax which rendered the card
        // transparent in some browsers, causing rarity glow to flood the card.
        background:
          "linear-gradient(180deg, oklch(0.2 0.025 275) 0%, oklch(0.16 0.022 275) 100%)",
        boxShadow: `0 24px 60px -40px ${color}55, inset 0 1px 0 rgb(255 255 255 / 6%)`,
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
            variant={crate.artVariant ?? "chest"}
            imageUrl={crate.artImageUrl}
          />
          <div className="flex flex-col items-center text-center">
            {/*
             * Wrap in inline-block + explicit `color: transparent` so the
             * gradient text clip works in Firefox / Safari as well as
             * Chromium. Without these two the linear-gradient would render
             * as a solid color block behind the glyphs on non-WebKit
             * browsers, which is why the name sometimes appeared as a flat
             * color bar in the preview panel.
             */}
            <h3
              className="font-display text-xl sm:text-2xl font-semibold inline-block"
              style={{
                background: `linear-gradient(90deg, ${rarity.from}, ${rarity.to})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
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
 * Per-variant crate art. Every variant shares the same idle / opening /
 * opened state machine so the surrounding reveal + shower logic doesn't
 * need to care which preset an operator picked.
 */
export function CrateArt({
  color,
  from,
  to,
  state,
  variant = "chest",
  size = "lg",
  imageUrl,
}: {
  color: string;
  from: string;
  to: string;
  state: "idle" | "opening" | "opened";
  variant?: CrateArtVariant;
  /** "lg" matches the card (~112px), "sm" is for pickers (~72px). */
  size?: "lg" | "sm";
  /** When `variant === "custom"`, the image rendered in place of presets. */
  imageUrl?: string;
}) {
  const shake = state === "opening";
  const lidOpen = state === "opening" || state === "opened";
  const sizeClass = size === "sm" ? "size-16" : "size-28 sm:size-32";

  // Fall back to the default chest if custom variant is selected but no
  // image has been uploaded yet — avoids an empty box in the picker.
  const effectiveVariant =
    variant === "custom" && !imageUrl ? "chest" : variant;

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
      className={cn("relative", sizeClass)}
      style={{ filter: `drop-shadow(0 8px 14px ${color}33)` }}
    >
      {/* Shared interior glow sits behind every variant. */}
      <motion.div
        initial={false}
        animate={{
          opacity: lidOpen ? 1 : 0,
          scale: lidOpen ? 1.6 : 0.9,
        }}
        transition={{ duration: 0.6 }}
        className="absolute inset-[18%] rounded-full"
        style={{
          background: `radial-gradient(closest-side, ${to}, ${from} 60%, transparent 75%)`,
          filter: "blur(10px)",
        }}
      />

      {effectiveVariant === "chest" && (
        <ChestArt from={from} to={to} lidOpen={lidOpen} />
      )}
      {effectiveVariant === "orb" && (
        <OrbArt from={from} to={to} lidOpen={lidOpen} />
      )}
      {effectiveVariant === "gem" && (
        <GemArt from={from} to={to} lidOpen={lidOpen} />
      )}
      {effectiveVariant === "card" && (
        <CardArt from={from} to={to} lidOpen={lidOpen} />
      )}
      {effectiveVariant === "vault" && (
        <VaultArt from={from} to={to} lidOpen={lidOpen} />
      )}
      {effectiveVariant === "custom" && imageUrl && (
        <CustomArt imageUrl={imageUrl} color={color} lidOpen={lidOpen} />
      )}
    </motion.div>
  );
}

/**
 * Variant: custom image. Gentle float while idle, scale-up + fade-out
 * when opening, so the uploaded art plays the same "reveal" beat as
 * the built-in presets. Works with any aspect ratio — `object-contain`
 * prevents stretching, a radial glow ring rhymes the art with the rest
 * of the card.
 */
function CustomArt({
  imageUrl,
  color,
  lidOpen,
}: {
  imageUrl: string;
  color: string;
  lidOpen: boolean;
}) {
  return (
    <motion.div
      initial={false}
      animate={
        lidOpen
          ? { scale: 1.25, opacity: 0, y: -8 }
          : { y: [0, -4, 0], opacity: 1, scale: 1 }
      }
      transition={
        lidOpen
          ? { duration: 0.7, ease: "easeOut" }
          : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
      }
      className="absolute inset-[6%] grid place-items-center"
    >
      <div
        aria-hidden
        className="absolute inset-[12%] rounded-full blur-xl opacity-60"
        style={{ background: `radial-gradient(circle, ${color}88, transparent 70%)` }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        className="relative h-full w-full object-contain"
        style={{ filter: `drop-shadow(0 6px 10px ${color}55)` }}
      />
    </motion.div>
  );
}

/* ---- variant: chest (the original two-panel treasure box) ---- */
function ChestArt({
  from,
  to,
  lidOpen,
}: {
  from: string;
  to: string;
  lidOpen: boolean;
}) {
  return (
    <>
      <div
        className="absolute inset-x-[8%] bottom-0 top-[38%] rounded-[14px] border"
        style={{
          background: `linear-gradient(180deg, ${from}ee, ${from}aa)`,
          borderColor: `${to}99`,
          boxShadow: `inset 0 -8px 20px ${from}66, inset 0 2px 0 ${to}99`,
        }}
      />
      <div
        className="absolute left-1/2 top-[38%] h-[18%] w-[14%] -translate-x-1/2 rounded-md border"
        style={{
          background: `linear-gradient(180deg, ${to}, ${from})`,
          borderColor: `${to}bb`,
        }}
      />
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
    </>
  );
}

/* ---- variant: orb (glowing sphere, pulses then shatters outward) ---- */
function OrbArt({
  from,
  to,
  lidOpen,
}: {
  from: string;
  to: string;
  lidOpen: boolean;
}) {
  return (
    <>
      <motion.div
        initial={false}
        animate={
          lidOpen
            ? { scale: 1.35, opacity: 0 }
            : { scale: [1, 1.05, 1], opacity: 1 }
        }
        transition={
          lidOpen
            ? { duration: 0.7 }
            : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
        }
        className="absolute inset-[14%] rounded-full border"
        style={{
          background: `radial-gradient(circle at 30% 28%, ${to}, ${from} 55%, oklch(0.14 0.03 275) 100%)`,
          borderColor: `${to}aa`,
          boxShadow: `inset 0 0 30px ${to}66, 0 0 28px ${to}55`,
        }}
      />
      <motion.div
        initial={false}
        animate={{ opacity: lidOpen ? 0 : 0.9, scale: lidOpen ? 0.6 : 1 }}
        transition={{ duration: 0.4 }}
        className="absolute left-[28%] top-[22%] h-[18%] w-[28%] rounded-full blur-[1px]"
        style={{ background: "rgb(255 255 255 / 55%)" }}
      />
    </>
  );
}

/* ---- variant: gem (angular diamond with rotating facets) ---- */
function GemArt({
  from,
  to,
  lidOpen,
}: {
  from: string;
  to: string;
  lidOpen: boolean;
}) {
  return (
    <motion.div
      initial={false}
      animate={
        lidOpen
          ? { rotate: 360, scale: 1.15 }
          : { rotate: [0, 6, -6, 0], scale: 1 }
      }
      transition={
        lidOpen
          ? { duration: 1.0, ease: "easeOut" }
          : { duration: 6, repeat: Infinity, ease: "easeInOut" }
      }
      className="absolute inset-[14%]"
      style={{ transformOrigin: "center" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${to} 0%, ${from} 55%, oklch(0.22 0.05 275) 100%)`,
          clipPath:
            "polygon(50% 0%, 100% 35%, 80% 100%, 20% 100%, 0% 35%)",
          filter: `drop-shadow(0 0 16px ${to}88)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "linear-gradient(160deg, rgb(255 255 255 / 55%), transparent 45%)",
          clipPath: "polygon(50% 0%, 100% 35%, 80% 100%, 20% 100%, 0% 35%)",
          mixBlendMode: "overlay",
        }}
      />
    </motion.div>
  );
}

/* ---- variant: card (scratch / tarot card that flips) ---- */
function CardArt({
  from,
  to,
  lidOpen,
}: {
  from: string;
  to: string;
  lidOpen: boolean;
}) {
  return (
    <motion.div
      initial={false}
      animate={
        lidOpen
          ? { rotateY: 180, y: -6 }
          : { rotateY: [0, -4, 4, 0], y: 0 }
      }
      transition={
        lidOpen
          ? { duration: 0.8, ease: "easeInOut" }
          : { duration: 4, repeat: Infinity, ease: "easeInOut" }
      }
      className="absolute inset-[18%]"
      style={{ transformStyle: "preserve-3d", perspective: 800 }}
    >
      <div
        className="absolute inset-0 rounded-xl border"
        style={{
          background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)`,
          borderColor: `${to}cc`,
          boxShadow: `inset 0 1px 0 ${to}, 0 12px 24px -12px ${from}aa`,
          backfaceVisibility: "hidden",
        }}
      >
        <div
          className="absolute inset-2 rounded-lg"
          style={{
            background:
              "repeating-linear-gradient(135deg, rgb(255 255 255 / 8%) 0 6px, transparent 6px 12px)",
          }}
        />
        <div
          className="absolute inset-0 grid place-items-center text-lg font-black"
          style={{ color: "rgb(255 255 255 / 80%)" }}
        >
          ?
        </div>
      </div>
    </motion.div>
  );
}

/* ---- variant: vault (bank door with spinning dial) ---- */
function VaultArt({
  from,
  to,
  lidOpen,
}: {
  from: string;
  to: string;
  lidOpen: boolean;
}) {
  return (
    <>
      <div
        className="absolute inset-[10%] rounded-2xl border"
        style={{
          background: `linear-gradient(180deg, ${from}, oklch(0.18 0.025 275))`,
          borderColor: `${to}99`,
          boxShadow: `inset 0 2px 0 ${to}66, 0 8px 20px -12px ${from}aa`,
        }}
      />
      <motion.div
        initial={false}
        animate={{
          rotate: lidOpen ? 540 : 0,
          scale: lidOpen ? 0.8 : 1,
        }}
        transition={{
          duration: lidOpen ? 0.9 : 0.4,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-1/2 h-[44%] w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{
          background: `radial-gradient(circle at 30% 28%, ${to}, ${from})`,
          borderColor: `${to}`,
          boxShadow: `inset 0 0 16px ${from}aa, 0 0 14px ${to}66`,
        }}
      >
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <span
            key={deg}
            className="absolute left-1/2 top-1/2 block h-[42%] w-[4px] -translate-x-1/2 origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${deg}deg)`,
              background: `linear-gradient(180deg, ${to}, transparent)`,
            }}
          />
        ))}
        <span
          className="absolute left-1/2 top-1/2 size-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: `${from}`, boxShadow: `inset 0 0 6px ${to}` }}
        />
      </motion.div>
    </>
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
