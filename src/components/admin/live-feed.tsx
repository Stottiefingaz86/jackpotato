"use client";

import { memo, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useJackpotStream } from "@/hooks/use-jackpot-stream";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Zap, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RealtimeEvent } from "@/lib/types";

function relative(ts: string) {
  const diff = Date.now() - Date.parse(ts);
  if (diff < 60_000) return `${Math.max(1, Math.round(diff / 1000))}s ago`;
  if (diff < 3600_000) return `${Math.round(diff / 60_000)}m ago`;
  return `${Math.round(diff / 3600_000)}h ago`;
}

type FeedRow = {
  key: string;
  timestamp: string;
  kind: RealtimeEvent["type"];
  label: string;
};

function buildRows(events: RealtimeEvent[], limit: number): FeedRow[] {
  return events.slice(0, limit).map((e, i) => {
    const key =
      e.type +
      ("timestamp" in e ? e.timestamp : "") +
      ("tierId" in e ? e.tierId : "") +
      ("gameId" in e ? e.gameId : "") +
      i;
    let label = "";
    if (e.type === "jackpot.won") {
      label = `${e.playerDisplay} won €${e.winAmount.toLocaleString()} · ${e.triggerType}`;
    } else if (e.type === "jackpot.updated") {
      label = `Tier ${e.tierId.replace("tr_", "")} +€${e.contributionAmount.toFixed(2)} → €${e.currentAmount.toLocaleString()}`;
    } else if (e.type === "bet.ingested") {
      label = `Bet €${e.stakeAmount} · ${e.gameId}`;
    } else if (e.type === "campaign.paused") {
      label = `Campaign ${e.campaignId} paused`;
    } else if (e.type === "campaign.resumed") {
      label = `Campaign ${e.campaignId} resumed`;
    } else if (e.type === "widget.updated") {
      label = `Widget ${e.widgetId} updated`;
    } else {
      label = "event";
    }
    return { key, timestamp: e.timestamp, kind: e.type, label };
  });
}

const Row = memo(function Row({ row }: { row: FeedRow }) {
  return (
    <li className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/40")}>
      {row.kind === "jackpot.won" ? (
        <Trophy className="size-3.5 text-amber-400" />
      ) : row.kind === "jackpot.updated" ? (
        <Zap className="size-3.5 text-primary" />
      ) : (
        <Activity className="size-3.5 text-muted-foreground" />
      )}
      <span className="text-xs text-muted-foreground shrink-0 w-16 tabular">
        {relative(row.timestamp)}
      </span>
      <span className="text-xs truncate">{row.label}</span>
    </li>
  );
});

export function LiveFeed({
  title = "Activity stream",
  description = "Real-time contributions and winner events as they happen.",
  limit = 25,
}: {
  title?: string;
  description?: string;
  limit?: number;
}) {
  const { recentEvents } = useJackpotStream();
  const rows = useMemo(() => buildRows(recentEvents, limit), [recentEvents, limit]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="text-primary size-4" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ScrollArea className="h-80 pr-2">
          <ul className="flex flex-col gap-0.5 text-sm">
            {rows.map((row) => (
              <Row key={row.key} row={row} />
            ))}
            {rows.length === 0 && (
              <li className="text-xs text-muted-foreground p-3">
                Waiting for events…
              </li>
            )}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
