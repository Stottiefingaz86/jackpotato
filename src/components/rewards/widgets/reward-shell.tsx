"use client";

import type { CSSProperties, ReactNode } from "react";
import { ThemePattern } from "@/components/effects/theme-pattern";
import type { ThemePattern as ThemePatternType } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Themed container shell shared across every rewards widget so they match the
 * jackpot widget "signature" look — radial glow, subtle beam pattern, themed
 * border and shadow. Any widget wrapped in a `<ThemeScope>` automatically picks
 * up the tenant/brand tokens via `--jp-*` CSS vars; standalone usage falls back
 * to the platform defaults baked into the CSS custom property definitions.
 *
 * `RewardShell` also publishes a small set of `--rw-*` CSS custom properties
 * so descendants can render *theme-aware* inner surfaces (cards, progress
 * tracks, borders) without reaching back to the app-global `bg-muted` /
 * `bg-background` tokens — those stay grey regardless of the active preset.
 */
export function RewardShell({
  children,
  className,
  style,
  pattern = "beams",
  pad = true,
  glow = "primary",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  pattern?: ThemePatternType;
  /** When false, caller handles its own padding. */
  pad?: boolean;
  /** Pick which theme token drives the outer radial glow. */
  glow?: "primary" | "secondary" | "accent";
  as?: "div" | "section" | "aside" | "article";
}) {
  const glowVar =
    glow === "accent"
      ? "--jp-accent"
      : glow === "secondary"
        ? "--jp-secondary"
        : "--jp-primary";

  // Theme-aware surface + border tokens. Borders are derived from the
  // *surface* color (a slight luminance lift on `--jp-card-2`), NOT from
  // `--jp-border` — otherwise they render as cool white strokes on warm
  // themes like Crypto Sunset. Deriving from the surface guarantees every
  // edge stays hue-matched to whatever preset is active.
  const surfaceVars = {
    "--rw-surface":
      "oklch(from var(--jp-card-2, oklch(0.24 0.028 275)) l c h / 55%)",
    "--rw-surface-muted":
      "oklch(from var(--jp-card-2, oklch(0.24 0.028 275)) l c h / 30%)",
    "--rw-surface-deep":
      "oklch(from var(--jp-bg, oklch(0.14 0.02 275)) l c h / 60%)",
    "--rw-track":
      "oklch(from var(--jp-card-2, oklch(0.24 0.028 275)) l c h / 55%)",
    "--rw-border":
      "oklch(from var(--jp-card-2, oklch(0.24 0.028 275)) calc(l + 0.09) c h / 70%)",
    "--rw-border-soft":
      "oklch(from var(--jp-card-2, oklch(0.24 0.028 275)) calc(l + 0.05) c h / 35%)",
    "--rw-divider":
      "oklch(from var(--jp-card-2, oklch(0.24 0.028 275)) calc(l + 0.03) c h / 22%)",
  } as CSSProperties;

  return (
    <Tag
      className={cn(
        "relative overflow-hidden isolate rounded-[var(--jp-radius,1rem)] border",
        pad && "p-4 sm:p-5",
        className
      )}
      style={{
        borderColor:
          "oklch(from var(--jp-card-2, oklch(0.24 0.028 275)) calc(l + 0.08) c h / 55%)",
        background: [
          `radial-gradient(800px 360px at 12% -10%, oklch(from var(${glowVar}, oklch(0.72 0.22 300)) l c h / 22%), transparent 60%)`,
          `radial-gradient(700px 360px at 100% 110%, oklch(from var(--jp-secondary, oklch(0.6 0.24 340)) l c h / 16%), transparent 60%)`,
          `linear-gradient(180deg, oklch(from var(--jp-card, oklch(0.2 0.025 275)) l c h / 92%), oklch(from var(--jp-card-2, oklch(0.24 0.028 275)) l c h / 92%))`,
        ].join(","),
        boxShadow: `var(--jp-shadow, 0 20px 60px -20px oklch(0 0 0 / 60%)), 0 0 80px oklch(from var(${glowVar}, oklch(0.72 0.22 300)) l c h / 10%)`,
        color: "var(--jp-text, oklch(0.98 0.01 280))",
        ...surfaceVars,
        ...style,
      }}
    >
      <ThemePattern pattern={pattern} />
      <div className="relative z-10">{children}</div>
    </Tag>
  );
}
