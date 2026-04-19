"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Timer, Users, Trophy } from "lucide-react";
import type { Raffle } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RaffleCardProps {
  raffle: Raffle;
  /** Render in a compact variant used inside the admin list. */
  compact?: boolean;
  className?: string;
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-EU").format(n);
}

/** Count down to `target` and return a human label. Re-renders every second. */
function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return useMemo(() => {
    const diff = Date.parse(target) - now;
    if (diff <= 0) return { label: "Drawing…", urgent: true };
    const days = Math.floor(diff / 86400_000);
    const hours = Math.floor((diff % 86400_000) / 3600_000);
    const mins = Math.floor((diff % 3600_000) / 60_000);
    const secs = Math.floor((diff % 60_000) / 1000);
    if (days >= 1) {
      return { label: `${days}d ${hours}h left`, urgent: false };
    }
    if (hours >= 1) {
      return { label: `${hours}h ${mins}m left`, urgent: days === 0 && hours < 3 };
    }
    return { label: `${mins}m ${String(secs).padStart(2, "0")}s`, urgent: true };
  }, [target, now]);
}

export function RaffleCard({ raffle, compact = false, className }: RaffleCardProps) {
  const grandPrize = raffle.prizes[0];
  const runners = raffle.prizes.slice(1);
  const color = raffle.color ?? "#a855f7";
  const countdown = useCountdown(raffle.drawAt);
  const isCompleted = raffle.status === "completed";

  const trigger = raffle.ticketTrigger;
  const triggerLabel =
    trigger.kind === "stake_amount"
      ? `${trigger.currency}${trigger.perTicket} staked = 1 ticket`
      : trigger.kind === "deposit_amount"
        ? `${trigger.currency}${trigger.perTicket} deposit = 1 ticket`
        : trigger.kind === "spin_count"
          ? `${trigger.perTicket} spins = 1 ticket`
          : "Manual operator grant";

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-xl border p-5",
        className
      )}
      style={{
        borderColor: `${color}55`,
        background:
          "linear-gradient(180deg, oklch(0.2 0.025 275) 0%, oklch(0.16 0.022 275) 100%)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full blur-3xl opacity-30"
        style={{ background: color }}
      />

      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="grid size-8 place-items-center rounded-full"
            style={{ background: `${color}22`, border: `1px solid ${color}66` }}
          >
            <Ticket className="size-4" style={{ color }} />
          </span>
          <div className="flex flex-col leading-tight">
            <span
              className="text-[10px] uppercase tracking-[0.24em]"
              style={{ color: `${color}dd` }}
            >
              Raffle
            </span>
            <h3 className="text-base font-semibold text-foreground">
              {raffle.name}
            </h3>
          </div>
        </div>
        {!isCompleted ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-semibold tabular",
              countdown.urgent
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-border/60 bg-card/60 text-muted-foreground"
            )}
          >
            <Timer className="size-3" />
            {countdown.label}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Completed
          </span>
        )}
      </header>

      {!compact && (
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {raffle.description}
        </p>
      )}

      {grandPrize && (
        <div
          className="mt-4 rounded-lg border p-3 relative overflow-hidden"
          style={{
            borderColor: `${color}44`,
            background: `linear-gradient(135deg, ${color}18 0%, transparent 80%)`,
          }}
        >
          <div
            className="text-[10px] uppercase tracking-[0.24em]"
            style={{ color: `${color}cc` }}
          >
            Grand prize
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Trophy className="size-5 shrink-0" style={{ color }} />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-lg font-semibold text-foreground">
                {grandPrize.label}
              </span>
              {grandPrize.subtitle && (
                <span className="text-xs text-muted-foreground">
                  {grandPrize.subtitle}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {runners.length > 0 && !compact && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {runners.slice(0, 4).map((p) => (
            <li
              key={p.id}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/60 px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {p.label}
            </li>
          ))}
          {runners.length > 4 && (
            <li className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/60 px-2 py-0.5 text-[11px] text-muted-foreground">
              +{runners.length - 4} more
            </li>
          )}
        </ul>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <Stat
          icon={<Ticket className="size-3.5" />}
          label="Tickets"
          value={formatNumber(raffle.totalTickets)}
        />
        <Stat
          icon={<Users className="size-3.5" />}
          label="Players"
          value={formatNumber(raffle.totalPlayers)}
        />
        <Stat
          icon={<Trophy className="size-3.5" />}
          label="Pool"
          value={formatCurrency(
            raffle.prizes.reduce((s, p) => s + (p.value || 0), 0),
            raffle.currency
          )}
        />
      </div>

      <div className="mt-3 text-[11px] text-muted-foreground">
        {triggerLabel}
        {raffle.maxTicketsPerPlayer && (
          <span> · max {raffle.maxTicketsPerPlayer}/player</span>
        )}
      </div>
    </motion.article>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-card/40 px-2 py-1.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold tabular text-foreground">
        {value}
      </div>
    </div>
  );
}
