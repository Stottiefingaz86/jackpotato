"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface RewardsAnalyticsProps {
  daily: Array<{
    day: string;
    opens: number;
    tickets: number;
    awarded: number;
  }>;
  byRarity: Array<{ rarity: string; opens: number }>;
  byPrizeType: Array<{ type: string; value: number }>;
  topCrates: Array<{ name: string; rarity: string; opens: number }>;
  raffleRows: Array<{ name: string; tickets: number; prizes: number }>;
}

const RARITY_COLORS: Record<string, string> = {
  common: "oklch(0.75 0.05 240)",
  rare: "oklch(0.7 0.17 230)",
  epic: "oklch(0.68 0.2 300)",
  legendary: "oklch(0.82 0.18 85)",
  mythic: "oklch(0.68 0.24 20)",
};

const TYPE_COLORS = [
  "oklch(0.72 0.22 300)",
  "oklch(0.6 0.24 340)",
  "oklch(0.84 0.19 85)",
  "oklch(0.65 0.2 200)",
  "oklch(0.7 0.2 140)",
];

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
};

export function RewardsAnalyticsCharts({
  daily,
  byRarity,
  byPrizeType,
  topCrates,
  raffleRows,
}: RewardsAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Crate opens vs raffle tickets</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="gOpens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.22 300)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="oklch(0.72 0.22 300)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.84 0.19 85)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="oklch(0.84 0.19 85)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  name="Crate opens"
                  type="monotone"
                  dataKey="opens"
                  stroke="oklch(0.72 0.22 300)"
                  fill="url(#gOpens)"
                  strokeWidth={2}
                />
                <Area
                  name="Raffle tickets"
                  type="monotone"
                  dataKey="tickets"
                  stroke="oklch(0.84 0.19 85)"
                  fill="url(#gTickets)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prize value by type</CardTitle>
            <CardDescription>30-day split across every live crate</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {byPrizeType.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                No prize data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byPrizeType}
                    dataKey="value"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {byPrizeType.map((_, i) => (
                      <Cell
                        key={`prize-${i}`}
                        fill={TYPE_COLORS[i % TYPE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Opens by rarity</CardTitle>
            <CardDescription>30-day crate open volume</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {byRarity.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                No crates configured yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byRarity}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="rarity"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickFormatter={(v: string) =>
                      v.charAt(0).toUpperCase() + v.slice(1)
                    }
                  />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="opens" radius={[6, 6, 0, 0]}>
                    {byRarity.map((r, i) => (
                      <Cell
                        key={`rarity-${i}`}
                        fill={
                          RARITY_COLORS[r.rarity] ??
                          TYPE_COLORS[i % TYPE_COLORS.length]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top crates</CardTitle>
            <CardDescription>Leading crates by opens</CardDescription>
          </CardHeader>
          <CardContent>
            {topCrates.length === 0 ? (
              <div className="grid h-48 place-items-center text-sm text-muted-foreground">
                No crates configured yet.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {topCrates.map((c) => (
                  <li
                    key={c.name}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2"
                  >
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        background:
                          RARITY_COLORS[c.rarity] ?? "oklch(0.7 0.12 280)",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {c.name}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {c.rarity}
                      </div>
                    </div>
                    <div className="text-sm tabular font-semibold">
                      {c.opens.toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Raffle activity</CardTitle>
          <CardDescription>Ticket volume per raffle</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          {raffleRows.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              No raffles configured yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={raffleRows} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  width={140}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="tickets"
                  radius={[0, 6, 6, 0]}
                  fill="oklch(0.72 0.22 300)"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
