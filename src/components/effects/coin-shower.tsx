"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

/**
 * Drops a mix of metallic coins and small sparkles from the top of the
 * surface whenever `trigger` changes. Purely cosmetic — used for the
 * jackpot.won celebration overlay and the CTA "Spin to win" moment.
 */
export function CoinShower({
  trigger,
  count = 24,
  duration = 2.4,
}: {
  trigger: number | string | boolean | null | undefined;
  count?: number;
  duration?: number;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    setActive((v) => v + 1);
    const t = window.setTimeout(() => setActive(0), duration * 1000 + 300);
    return () => window.clearTimeout(t);
  }, [trigger, duration]);

  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      // Horizontal position is set via CSS `left` (parent-relative) so the
      // coins spread across the whole surface instead of stacking at 0,0.
      xStart: Math.random() * 100,
      xEnd: Math.random() * 100,
      delay: Math.random() * 0.6,
      // Slightly smaller range — these read as coins without dominating
      // small widget surfaces like the must-drop meter.
      size: 14 + Math.random() * 12,
      rot: (Math.random() - 0.5) * 720,
      kind: Math.random() > 0.35 ? "coin" : "spark",
    }));
  }, [count, active]);

  return (
    <AnimatePresence>
      {active > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {particles.map((p) => (
            <motion.div
              key={`${active}-${p.id}`}
              // We animate CSS `top` / `left` (parent-relative percentages)
              // rather than framer-motion's `x` / `y` transforms, because
              // transform percentages resolve against the element's own
              // box — which makes tiny coins only travel ~30px before
              // stopping. Using `top` lets them fall across the full card.
              initial={{ top: "-12%", left: `${p.xStart}%`, opacity: 0, rotate: 0 }}
              animate={{
                top: "112%",
                left: `${p.xEnd}%`,
                opacity: [0, 1, 1, 0],
                rotate: p.rot,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration,
                ease: "easeIn",
                delay: p.delay,
              }}
              className="absolute"
              style={{ width: p.size, height: p.size }}
            >
              {p.kind === "coin" ? <Coin size={p.size} /> : <Spark size={p.size} />}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

function Coin({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      style={{
        // Only a small dark drop-shadow for depth — no colored halo which is
        // what was making overlapping coins look like yellow blobs.
        filter: "drop-shadow(0 1px 2px oklch(0 0 0 / 45%))",
      }}
    >
      <defs>
        <radialGradient id="jpCoinFace" cx="34%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#fff7c2" />
          <stop offset="45%" stopColor="#f5c518" />
          <stop offset="100%" stopColor="#8a4b06" />
        </radialGradient>
        <linearGradient id="jpCoinRim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="55%" stopColor="#b8751d" />
          <stop offset="100%" stopColor="#5c3206" />
        </linearGradient>
      </defs>
      {/* outer rim */}
      <circle
        cx="16"
        cy="16"
        r="15"
        fill="url(#jpCoinRim)"
        stroke="#3a1f03"
        strokeWidth="0.5"
      />
      {/* inner face */}
      <circle
        cx="16"
        cy="16"
        r="12"
        fill="url(#jpCoinFace)"
        stroke="#a16207"
        strokeWidth="0.6"
      />
      {/* $ glyph */}
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fontFamily="ui-serif, Georgia, serif"
        fontWeight="800"
        fontSize="15"
        fill="#5c3206"
      >
        $
      </text>
      {/* top-left specular highlight */}
      <ellipse
        cx="11.5"
        cy="10.5"
        rx="3.5"
        ry="1.8"
        fill="#fff"
        opacity="0.55"
      />
    </svg>
  );
}

function Spark({ size }: { size: number }) {
  const s = size * 0.75;
  return (
    <svg
      viewBox="0 0 24 24"
      width={s}
      height={s}
      style={{
        filter: "drop-shadow(0 0 3px oklch(1 0 0 / 55%))",
      }}
    >
      <path
        d="M12 2l1.4 6.6L20 10l-6.6 1.4L12 18l-1.4-6.6L4 10l6.6-1.4z"
        fill="#ffffff"
        opacity="0.9"
      />
    </svg>
  );
}
