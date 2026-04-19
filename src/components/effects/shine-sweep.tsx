"use client";

import { cn } from "@/lib/utils";

/**
 * A diagonal light sweep overlay. Wrap anything and add `.shine` behavior.
 */
export function ShineSweep({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit] shine", className)}
    />
  );
}
