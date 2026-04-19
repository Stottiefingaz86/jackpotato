"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * RollingNumber animates a numeric value with a spring and renders it with
 * currency/locale formatting. A subtle shimmer sweeps whenever the value
 * jumps.
 */
export function RollingNumber({
  value,
  currency = "EUR",
  locale = "en-EU",
  decimals = 2,
  className,
  compact = false,
  prefix,
  suffix,
}: {
  value: number;
  currency?: string;
  locale?: string;
  decimals?: 0 | 1 | 2;
  className?: string;
  compact?: boolean;
  prefix?: string;
  suffix?: string;
}) {
  const raw = useMotionValue(value);
  const spring = useSpring(raw, {
    // A little softer + heavier than a snappy spring so you can actually see
    // the digits roll between each stream tick instead of snapping instantly.
    stiffness: 55,
    damping: 22,
    mass: 1.1,
    restDelta: 0.001,
  });
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        notation: compact ? "compact" : "standard",
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      }),
    [locale, currency, compact, decimals]
  );

  const text = useTransform(spring, (v) => formatter.format(Math.max(0, v)));

  useEffect(() => {
    raw.set(value);
  }, [value, raw]);

  return (
    <span
      className={cn(
        "tabular font-display inline-flex items-baseline whitespace-nowrap",
        className
      )}
      style={{ textShadow: "0 0 40px oklch(from var(--jp-primary) l c h / 35%)" }}
    >
      {prefix ? <span className="mr-1 opacity-80">{prefix}</span> : null}
      <motion.span>{text}</motion.span>
      {suffix ? <span className="ml-1 opacity-80">{suffix}</span> : null}
    </span>
  );
}
