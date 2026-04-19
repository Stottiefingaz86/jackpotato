"use client";

import { cn } from "@/lib/utils";

/**
 * A soft ambient glow that sits behind content. Uses CSS variables so it
 * inherits the current theme.
 */
export function GlowPulse({
  className,
  variant = "aurora",
}: {
  className?: string;
  variant?: "aurora" | "ring" | "beams";
}) {
  if (variant === "aurora") {
    return (
      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-0", className)}
      >
        <div
          className="absolute -top-24 -left-16 size-[420px] rounded-full blur-3xl opacity-60"
          style={{ background: "var(--jp-gradient-soft, var(--jp-gradient))" }}
        />
        <div
          className="absolute -bottom-24 -right-16 size-[420px] rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(circle at center, oklch(from var(--jp-accent) l c h / 40%), transparent 60%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[320px] rounded-full blur-2xl opacity-30"
          style={{
            background:
              "radial-gradient(circle at center, oklch(from var(--jp-secondary) l c h / 40%), transparent 60%)",
          }}
        />
      </div>
    );
  }

  if (variant === "ring") {
    return (
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 jp-pulse rounded-[inherit]",
          className
        )}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div
        className="absolute -inset-40 rotate-12 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, oklch(from var(--jp-primary) l c h / 14%) 0 2px, transparent 2px 120px)",
        }}
      />
    </div>
  );
}
