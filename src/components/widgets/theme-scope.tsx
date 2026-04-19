"use client";

import { cn } from "@/lib/utils";
import { themeToStyle } from "@/lib/theme";
import type { ThemeTokens } from "@/lib/types";

/**
 * Applies a jackpot theme as CSS variables on a wrapping div so any
 * descendant widget reads from `--jp-*` consistently.
 */
export function ThemeScope({
  tokens,
  className,
  style,
  children,
  as: Tag = "div",
}: {
  tokens: ThemeTokens;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  as?: "div" | "section" | "aside" | "article";
}) {
  const vars = themeToStyle(tokens);
  return (
    <Tag className={cn("jp-scope", className)} style={{ ...vars, ...style }}>
      {children}
    </Tag>
  );
}
