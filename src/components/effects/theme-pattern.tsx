"use client";

import { cn } from "@/lib/utils";
import type { ThemePattern as ThemePatternType } from "@/lib/types";

/**
 * Renders a decorative background pattern layer behind a widget's content.
 * All patterns are purely CSS — no JS, no animation — so they never trigger
 * re-renders or degrade scroll performance. They inherit the current
 * `--jp-*` theme variables, so swapping theme colors automatically re-tints
 * the pattern without extra work.
 *
 * Intended usage: drop a `<ThemePattern pattern={theme.pattern} />` as the
 * first child inside a widget's outer container. It absolutely positions
 * itself and sits at z-index 0 (behind any `relative z-10` content).
 */
export function ThemePattern({
  pattern = "beams",
  className,
  opacity,
}: {
  pattern?: ThemePatternType;
  className?: string;
  /** Override the default opacity if the pattern feels too loud in a
   * particular widget. Defaults to a per-pattern tuned value. */
  opacity?: number;
}) {
  if (pattern === "none") return null;

  if (pattern === "aurora") {
    return (
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          className
        )}
        style={{ opacity: opacity ?? 1 }}
      >
        <div
          className="absolute -top-24 -left-16 size-[420px] rounded-full blur-3xl opacity-55"
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[320px] rounded-full blur-2xl opacity-25"
          style={{
            background:
              "radial-gradient(circle at center, oklch(from var(--jp-secondary) l c h / 40%), transparent 60%)",
          }}
        />
      </div>
    );
  }

  if (pattern === "beams") {
    // Vertical "light beams" — the look from the original Must-Drop card.
    return (
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          className
        )}
        style={{ opacity: opacity ?? 0.3 }}
      >
        <div
          className="absolute -inset-40 rotate-12"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, oklch(from var(--jp-primary) l c h / 14%) 0 2px, transparent 2px 120px)",
          }}
        />
      </div>
    );
  }

  if (pattern === "diagonal") {
    return (
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          className
        )}
        style={{
          opacity: opacity ?? 0.22,
          backgroundImage:
            "repeating-linear-gradient(45deg, oklch(from var(--jp-primary) l c h / 18%) 0 1px, transparent 1px 14px)",
        }}
      />
    );
  }

  if (pattern === "grid") {
    // Classic blueprint grid — 32px cells with a subtle primary tint.
    return (
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          className
        )}
        style={{
          opacity: opacity ?? 0.35,
          backgroundImage: [
            "linear-gradient(to right, oklch(from var(--jp-primary) l c h / 10%) 1px, transparent 1px)",
            "linear-gradient(to bottom, oklch(from var(--jp-primary) l c h / 10%) 1px, transparent 1px)",
          ].join(","),
          backgroundSize: "32px 32px, 32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 45%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 45%, transparent 80%)",
        }}
      />
    );
  }

  if (pattern === "dots") {
    // Fine dot matrix — matches the "casino felt" look.
    return (
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          className
        )}
        style={{
          opacity: opacity ?? 0.45,
          backgroundImage:
            "radial-gradient(oklch(from var(--jp-primary) l c h / 18%) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 85%)",
        }}
      />
    );
  }

  if (pattern === "noise") {
    // Subtle film grain — pure SVG so it stays crisp at any scale and
    // doesn't need an external asset.
    const svg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
        <filter id='n'>
          <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='4'/>
          <feColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/>
        </filter>
        <rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/>
      </svg>`
    );
    return (
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          className
        )}
        style={{
          opacity: opacity ?? 0.18,
          backgroundImage: `url("data:image/svg+xml;utf8,${svg}")`,
          backgroundSize: "160px 160px",
          mixBlendMode: "overlay",
        }}
      />
    );
  }

  return null;
}

/** Human-readable labels used by the theme editor + widget form. */
export const THEME_PATTERN_LABELS: Record<ThemePatternType, string> = {
  none: "None",
  beams: "Light beams",
  diagonal: "Diagonal lines",
  grid: "Blueprint grid",
  dots: "Dot matrix",
  aurora: "Aurora glow",
  noise: "Film grain",
};
