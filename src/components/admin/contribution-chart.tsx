"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface ContributionPoint {
  time: string;
  contributions: number;
  payouts: number;
}

export function ContributionChart({
  data,
  title = "Contributions · last 24h",
  description = "Contributions vs payouts across all active campaigns.",
  currency = "EUR",
}: {
  data: ContributionPoint[];
  title?: string;
  description?: string;
  currency?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-64 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 14, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gCon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--jp-primary)" stopOpacity={0.55} />
                <stop offset="100%" stopColor="var(--jp-primary)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gPay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--jp-accent)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--jp-accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
            <XAxis
              dataKey="time"
              stroke="oklch(1 0 0 / 40%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="oklch(1 0 0 / 40%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$"}${v.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.18 0.02 275)",
                border: "1px solid oklch(1 0 0 / 12%)",
                borderRadius: 10,
                fontSize: 12,
              }}
              labelStyle={{ color: "oklch(1 0 0 / 70%)" }}
              formatter={(value: number, name) => [
                `${currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$"}${value.toLocaleString()}`,
                name,
              ]}
            />
            <Area
              type="monotone"
              dataKey="contributions"
              stroke="var(--jp-primary)"
              fill="url(#gCon)"
              strokeWidth={2}
              name="Contributions"
            />
            <Area
              type="monotone"
              dataKey="payouts"
              stroke="var(--jp-accent)"
              fill="url(#gPay)"
              strokeWidth={2}
              name="Payouts"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
