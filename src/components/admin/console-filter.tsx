"use client";

import { useEffect } from "react";

/**
 * Silences a specific, harmless Recharts layout warning that fires on every
 * chart render before `ResponsiveContainer`'s ResizeObserver has measured the
 * parent. The warning floods the console on real-time dashboards and can
 * freeze the tab on its own (console is synchronous in DevTools). We leave
 * every other warning/error untouched.
 */
export function ConsoleFilter() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as Window & { __jpConsoleFiltered?: boolean };
    if (w.__jpConsoleFiltered) return;
    w.__jpConsoleFiltered = true;

    const isRechartsNoise = (args: unknown[]) => {
      const first = args[0];
      const msg =
        typeof first === "string"
          ? first
          : first && typeof first === "object" && "message" in first
            ? String((first as { message?: unknown }).message)
            : "";
      return (
        msg.includes("of chart should be greater than 0") ||
        msg.includes("The width(") ||
        msg.includes("ResizeObserver loop")
      );
    };

    const origWarn = console.warn;
    const origError = console.error;
    const origLog = console.log;

    console.warn = (...args: unknown[]) => {
      if (isRechartsNoise(args)) return;
      origWarn.apply(console, args);
    };
    console.error = (...args: unknown[]) => {
      if (isRechartsNoise(args)) return;
      origError.apply(console, args);
    };
    console.log = (...args: unknown[]) => {
      if (isRechartsNoise(args)) return;
      origLog.apply(console, args);
    };
  }, []);

  return null;
}
