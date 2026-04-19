"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Zap } from "lucide-react";
import { toast } from "sonner";
import { setSimSpeed, toggleSimulator } from "@/app/actions/sandbox";

export function SimControls({
  running,
  speedMs,
}: {
  running: boolean;
  speedMs: number;
}) {
  const [speed, setSpeed] = useState(speedMs);
  const [isPending, start] = useTransition();

  function toggle() {
    start(async () => {
      await toggleSimulator();
    });
  }

  function commitSpeed(v: number) {
    start(async () => {
      await setSimSpeed(v);
      toast.message(`Simulator speed: ${v}ms between bursts`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        onClick={toggle}
        disabled={isPending}
        variant={running ? "destructive" : "default"}
        className="rounded-full"
      >
        {running ? (
          <>
            <Square data-icon="inline-start" />
            Stop simulator
          </>
        ) : (
          <>
            <Play data-icon="inline-start" />
            Start simulator
          </>
        )}
      </Button>
      <Badge variant={running ? "secondary" : "outline"} className="rounded-full">
        {running ? (
          <>
            <span className="mr-1.5 size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Running
          </>
        ) : (
          "Idle"
        )}
      </Badge>
      <div className="flex-1 min-w-56 max-w-md">
        <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
          <span>
            <Zap className="inline size-3 mr-1" />
            Speed
          </span>
          <span className="tabular">{speed} ms</span>
        </div>
        <Slider
          value={[speed]}
          min={50}
          max={1500}
          step={10}
          onValueChange={(v) => {
            const n = Array.isArray(v) ? v[0] : v;
            setSpeed(n);
          }}
          onValueCommitted={(v) => {
            const n = Array.isArray(v) ? v[0] : v;
            commitSpeed(n);
          }}
        />
      </div>
    </div>
  );
}
