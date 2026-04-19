"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useJackpotStream } from "@/hooks/use-jackpot-stream";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Zap, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function relative(ts: string) {
  const diff = Date.now() - Date.parse(ts);
  if (diff < 60_000) return `${Math.max(1, Math.round(diff / 1000))}s ago`;
  if (diff < 3600_000) return `${Math.round(diff / 60_000)}m ago`;
  return `${Math.round(diff / 3600_000)}h ago`;
}

export function LiveFeed({
  title = "Activity stream",
  description = "Real-time contributions and winner events as they happen.",
  limit = 50,
}: {
  title?: string;
  description?: string;
  limit?: number;
}) {
  const { recentEvents } = useJackpotStream();
  const events = recentEvents.slice(0, limit);

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
            <AnimatePresence initial={false}>
              {events.map((e, i) => (
                <motion.li
                  key={
                    e.type +
                    ("timestamp" in e ? e.timestamp : "") +
                    ("tierId" in e ? e.tierId : "") +
                    ("gameId" in e ? e.gameId : "") +
                    i
                  }
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/40"
                  )}
                >
                  {e.type === "jackpot.won" ? (
                    <Trophy className="size-3.5 text-amber-400" />
                  ) : e.type === "jackpot.updated" ? (
                    <Zap className="size-3.5 text-primary" />
                  ) : (
                    <Activity className="size-3.5 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground shrink-0 w-16 tabular">
                    {relative(e.timestamp)}
                  </span>
                  <span className="text-xs truncate">
                    {e.type === "jackpot.won"
                      ? `${e.playerDisplay} won €${e.winAmount.toLocaleString()} · ${e.triggerType}`
                      : e.type === "jackpot.updated"
                      ? `Tier ${e.tierId.replace("tr_", "")} +€${e.contributionAmount.toFixed(2)} → €${e.currentAmount.toLocaleString()}`
                      : e.type === "bet.ingested"
                      ? `Bet €${e.stakeAmount} · ${e.gameId}`
                      : e.type === "campaign.paused"
                      ? `Campaign ${e.campaignId} paused`
                      : e.type === "campaign.resumed"
                      ? `Campaign ${e.campaignId} resumed`
                      : `Widget ${e.widgetId} updated`}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
            {events.length === 0 && (
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
