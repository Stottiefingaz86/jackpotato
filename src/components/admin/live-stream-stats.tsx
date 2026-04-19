"use client";

import { useJackpotStream } from "@/hooks/use-jackpot-stream";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Gauge, Trophy, Zap } from "lucide-react";
import { LiveSparkline } from "@/components/admin/live-sparkline";

export function LiveStreamStats() {
  const { recentEvents, recentWins, winCount, updateCount, connected } =
    useJackpotStream();
  const bets = recentEvents.filter((e) => e.type === "bet.ingested").length;
  const updates = recentEvents.filter(
    (e) => e.type === "jackpot.updated"
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="inline-flex items-center gap-1.5">
              <Activity className="size-3" />
              Stream status
            </span>
          </div>
          <div className="text-2xl font-bold tabular">
            {connected ? (
              <span className="text-emerald-300">Live</span>
            ) : (
              <span className="text-amber-300">Connecting...</span>
            )}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            SSE · /api/stream/jackpots
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="inline-flex items-center gap-1.5">
              <Zap className="size-3" />
              Contributions
            </span>
            <span className="tabular text-foreground">{updates}</span>
          </div>
          <LiveSparkline label="Updates/sec" color="oklch(0.72 0.22 300)" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="inline-flex items-center gap-1.5">
              <Gauge className="size-3" />
              Bets ingested
            </span>
            <span className="tabular text-foreground">{bets}</span>
          </div>
          <LiveSparkline label="Bets/sec" color="oklch(0.84 0.19 85)" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="inline-flex items-center gap-1.5">
              <Trophy className="size-3" />
              Wins
            </span>
            <span className="tabular text-foreground">{winCount}</span>
          </div>
          <div className="mt-2 text-2xl font-bold tabular text-amber-300">
            {recentWins.length}
          </div>
          <div className="text-xs text-muted-foreground">
            in current session · {updateCount} updates total
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
