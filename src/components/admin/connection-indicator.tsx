"use client";

import { useJackpotStream } from "@/hooks/use-jackpot-stream";
import { cn } from "@/lib/utils";

export function ConnectionIndicator({
  label = "Realtime",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const { connected, updateCount } = useJackpotStream();
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs",
        className
      )}
    >
      <span
        className={cn(
          "relative inline-block size-2 rounded-full",
          connected ? "bg-emerald-400" : "bg-amber-400"
        )}
      >
        {connected && (
          <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400/60" />
        )}
      </span>
      <span className="text-muted-foreground">
        {label} · {connected ? "live" : "connecting"}{" "}
        <span className="tabular opacity-60">{updateCount}</span>
      </span>
    </div>
  );
}
