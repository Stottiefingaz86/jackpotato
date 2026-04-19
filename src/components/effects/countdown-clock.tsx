"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function parts(ms: number) {
  const clamped = Math.max(0, ms);
  const totalSec = Math.floor(clamped / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/**
 * Countdown clock rendered as flip-style digit blocks. `target` is an ISO
 * date; the clock ticks every second until it reaches zero.
 */
export function CountdownClock({
  target,
  className,
  showDays = true,
  size = "md",
}: {
  target: string;
  className?: string;
  showDays?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remaining = Date.parse(target) - now;
  const { days, hours, minutes, seconds } = parts(remaining);

  const sizes = {
    sm: "text-base px-2 py-1 min-w-7",
    md: "text-xl px-2.5 py-1.5 min-w-9",
    lg: "text-3xl px-3 py-2 min-w-12",
  } as const;

  const Block = ({ label, v }: { label: string; v: string }) => (
    <div className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "tabular font-display rounded-md border text-center font-semibold",
          sizes[size]
        )}
        style={{
          background:
            "linear-gradient(180deg, oklch(from var(--jp-card) l c h / 90%), oklch(from var(--jp-card-2) l c h / 90%))",
          borderColor: "var(--jp-border)",
          color: "var(--jp-text)",
        }}
      >
        {v}
      </span>
      <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--jp-muted)" }}>
        {label}
      </span>
    </div>
  );

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {showDays && <Block label="d" v={pad(days)} />}
      {showDays && <span className="opacity-40">:</span>}
      <Block label="hrs" v={pad(hours)} />
      <span className="opacity-40">:</span>
      <Block label="min" v={pad(minutes)} />
      <span className="opacity-40">:</span>
      <Block label="sec" v={pad(seconds)} />
    </div>
  );
}
