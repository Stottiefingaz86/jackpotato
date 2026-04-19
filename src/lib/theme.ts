import type { ThemeTokens, WidgetTheme } from "@/lib/types";

/**
 * Theme resolver implementing the hierarchy from spec Section 12:
 *   Platform defaults -> Tenant default -> Brand default -> Widget-specific -> Placement-specific.
 * The final ThemeTokens object is then turned into CSS variables that the
 * widgets consume via the `--jp-*` custom properties.
 */

export const platformDefaults: ThemeTokens = {
  primary: "oklch(0.72 0.22 300)",
  secondary: "oklch(0.6 0.24 340)",
  accent: "oklch(0.84 0.19 85)",
  bg: "oklch(0.14 0.02 275)",
  card: "oklch(0.2 0.025 275)",
  card2: "oklch(0.24 0.028 275)",
  text: "oklch(0.98 0.01 280)",
  muted: "oklch(0.7 0.02 275)",
  border: "oklch(1 0 0 / 14%)",
  radius: "1rem",
  shadow: "0 20px 60px -20px oklch(0 0 0 / 60%)",
  glow: "0 0 60px oklch(0.72 0.22 300 / 45%)",
  fontHeading: "var(--font-sora), system-ui, sans-serif",
  fontBody: "var(--font-sans), system-ui, sans-serif",
  gradient:
    "linear-gradient(135deg, oklch(0.72 0.22 300) 0%, oklch(0.6 0.24 340) 50%, oklch(0.84 0.19 85) 100%)",
  motion: { pulse: true, glow: true, celebrate: true },
  density: "comfortable",
  currency: "EUR",
  locale: "en-EU",
};

export function mergeTokens(
  base: ThemeTokens,
  ...overrides: Array<Partial<ThemeTokens> | undefined>
): ThemeTokens {
  let out: ThemeTokens = { ...base };
  for (const o of overrides) {
    if (!o) continue;
    out = {
      ...out,
      ...o,
      motion: { ...out.motion, ...(o.motion ?? {}) },
    };
  }
  return out;
}

export interface ResolveThemeInput {
  tenantDefault?: WidgetTheme | null;
  brandDefault?: WidgetTheme | null;
  widgetTheme?: WidgetTheme | null;
  widgetOverrides?: Partial<ThemeTokens>;
  placementOverrides?: Partial<ThemeTokens>;
}

export function resolveTheme(input: ResolveThemeInput): ThemeTokens {
  return mergeTokens(
    platformDefaults,
    input.tenantDefault?.tokens,
    input.brandDefault?.tokens,
    input.widgetTheme?.tokens,
    input.widgetOverrides,
    input.placementOverrides
  );
}

/** Build a style object full of `--jp-*` custom properties. */
export function themeToStyle(t: ThemeTokens): React.CSSProperties {
  return {
    // Map our ThemeTokens to the --jp-* vars consumed by every widget.
    ["--jp-primary" as string]: t.primary,
    ["--jp-secondary" as string]: t.secondary,
    ["--jp-accent" as string]: t.accent,
    ["--jp-bg" as string]: t.bg,
    ["--jp-card" as string]: t.card,
    ["--jp-card-2" as string]: t.card2,
    ["--jp-text" as string]: t.text,
    ["--jp-muted" as string]: t.muted,
    ["--jp-border" as string]: t.border,
    ["--jp-radius" as string]: t.radius,
    ["--jp-shadow" as string]: t.shadow,
    ["--jp-glow" as string]: t.glow,
    ["--jp-font-heading" as string]: t.fontHeading,
    ["--jp-font-body" as string]: t.fontBody,
    ["--jp-gradient" as string]: t.gradient,
    ["--jp-motion-pulse" as string]: t.motion.pulse ? "1" : "0",
    ["--jp-motion-glow" as string]: t.motion.glow ? "1" : "0",
    ["--jp-motion-celebrate" as string]: t.motion.celebrate ? "1" : "0",
    ["--jp-density" as string]: t.density === "compact" ? "0.85" : "1",
    color: "var(--jp-text)",
    fontFamily: "var(--jp-font-body)",
  } as React.CSSProperties;
}

/** Format money with the theme's currency/locale defaults unless overridden. */
export function formatMoney(
  amount: number,
  currency: string = "EUR",
  locale: string = "en-EU",
  opts: { compact?: boolean; decimals?: 0 | 2 } = {}
): string {
  const { compact = false, decimals = 2 } = opts;
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    });
    return formatter.format(amount);
  } catch {
    return `${currency} ${amount.toFixed(decimals)}`;
  }
}
