"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useJackpotStream } from "@/hooks/use-jackpot-stream";

/** Rolling per-second event rate sparkline. */
export function LiveSparkline({
  height = 60,
  color = "var(--primary)",
  kinds = ["jackpot.updated", "bet.ingested", "jackpot.won"] as const,
  label = "Events / sec",
}: {
  height?: number;
  color?: string;
  kinds?: readonly string[];
  label?: string;
}) {
  const { recentEvents } = useJackpotStream();
  const [series, setSeries] = useState<number[]>(() => Array(40).fill(0));
  const [lastCount, setLastCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeries((prev) => {
        const next = [...prev.slice(1), Math.max(0, recentEvents.length - lastCount)];
        return next;
      });
      setLastCount(recentEvents.length);
    }, 1000);
    return () => clearInterval(id);
  }, [recentEvents.length, lastCount]);

  const latest = series[series.length - 1] ?? 0;
  const data = series.map((v, i) => ({ i, v }));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="tabular text-foreground">{latest.toFixed(0)}</span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${label})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      {kinds && null}
    </div>
  );
}
