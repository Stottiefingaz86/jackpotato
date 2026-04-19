"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RollingNumber } from "@/components/effects/rolling-number";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  format = "currency",
  currency = "EUR",
  trend,
  icon,
  className,
  hint,
}: {
  label: string;
  value: number;
  format?: "currency" | "number";
  currency?: string;
  trend?: { value: number; direction: "up" | "down"; suffix?: string };
  icon?: React.ReactNode;
  className?: string;
  hint?: React.ReactNode;
}) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          {icon}
          {label}
        </CardDescription>
        <CardTitle className="font-display text-3xl">
          {format === "currency" ? (
            <RollingNumber value={value} currency={currency} decimals={2} />
          ) : (
            <span className="tabular">{value.toLocaleString()}</span>
          )}
        </CardTitle>
      </CardHeader>
      {trend || hint ? (
        <CardContent className="flex items-center gap-3">
          {trend ? (
            <span
              className={cn(
                "text-xs tabular",
                trend.direction === "up"
                  ? "text-emerald-400"
                  : "text-rose-400"
              )}
            >
              {trend.direction === "up" ? "▲" : "▼"} {trend.value.toFixed(1)}%{" "}
              {trend.suffix ?? ""}
            </span>
          ) : null}
          {hint ? (
            <span className="text-xs text-muted-foreground">{hint}</span>
          ) : null}
        </CardContent>
      ) : null}
      <div
        aria-hidden
        className="absolute -right-10 -top-10 size-36 rounded-full blur-3xl opacity-40"
        style={{ background: "var(--jp-gradient)" }}
      />
    </Card>
  );
}
