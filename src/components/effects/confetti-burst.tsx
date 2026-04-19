"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

/**
 * Fire confetti (once) when `trigger` changes to a truthy value. Uses a
 * multi-burst choreography that feels like a jackpot win.
 *
 * Only `trigger` is observed — `intensity` and `colors` are read through refs
 * so that parent re-renders (e.g. SSE ticks) don't re-fire the confetti.
 */
export function ConfettiBurst({
  trigger,
  intensity = 1,
  colors = [
    "#a855f7",
    "#ec4899",
    "#facc15",
    "#22d3ee",
    "#34d399",
    "#ffffff",
  ],
}: {
  trigger: number | string | boolean | null | undefined;
  intensity?: number;
  colors?: string[];
}) {
  const intensityRef = useRef(intensity);
  const colorsRef = useRef(colors);
  const lastTriggerRef = useRef<typeof trigger>(undefined);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  useEffect(() => {
    if (!trigger) return;
    // Guard against StrictMode double-invoke or any accidental effect re-runs
    // with the same trigger value.
    if (lastTriggerRef.current === trigger) return;
    lastTriggerRef.current = trigger;

    const i = intensityRef.current;
    const defaults = {
      colors: colorsRef.current,
      disableForReducedMotion: true,
      scalar: 1.1,
    };

    const timeouts: number[] = [];

    confetti({
      ...defaults,
      particleCount: Math.round(120 * i),
      spread: 90,
      startVelocity: 55,
      ticks: 220,
      origin: { x: 0.5, y: 0.35 },
    });

    timeouts.push(
      window.setTimeout(() => {
        confetti({
          ...defaults,
          particleCount: Math.round(80 * i),
          angle: 60,
          spread: 70,
          startVelocity: 60,
          origin: { x: 0, y: 0.8 },
        });
        confetti({
          ...defaults,
          particleCount: Math.round(80 * i),
          angle: 120,
          spread: 70,
          startVelocity: 60,
          origin: { x: 1, y: 0.8 },
        });
      }, 180)
    );

    timeouts.push(
      window.setTimeout(() => {
        confetti({
          ...defaults,
          particleCount: Math.round(160 * i),
          spread: 140,
          startVelocity: 45,
          decay: 0.92,
          origin: { x: 0.5, y: 0.2 },
          shapes: ["circle", "square"],
        });
      }, 450)
    );

    return () => {
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [trigger]);

  return null;
}
