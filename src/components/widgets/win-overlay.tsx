"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { RollingNumber } from "@/components/effects/rolling-number";

export interface WinOverlayProps {
  show: boolean;
  title?: string;
  subtitle?: string;
  amount?: number;
  currency?: string;
  locale?: string;
  playerDisplay?: string;
  onClose?: () => void;
}

export function WinOverlay({
  show,
  title = "JACKPOT!",
  subtitle,
  amount,
  currency = "EUR",
  locale = "en-EU",
  playerDisplay,
  onClose,
}: WinOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center p-6"
          onClick={onClose}
          style={{
            background:
              "radial-gradient(closest-side, oklch(0 0 0 / 55%), oklch(0 0 0 / 80%))",
            backdropFilter: "blur(6px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.7, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="relative flex max-w-full flex-col items-center gap-2 rounded-[calc(var(--jp-radius))] border px-8 py-6 text-center"
            style={{
              borderColor: "var(--jp-border)",
              background:
                "linear-gradient(180deg, oklch(from var(--jp-card) l c h / 95%), oklch(from var(--jp-card-2) l c h / 95%))",
              boxShadow:
                "0 30px 80px -20px oklch(0 0 0 / 60%), 0 0 120px oklch(from var(--jp-primary) l c h / 45%)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-60"
              style={{
                background:
                  "conic-gradient(from 180deg at 50% 50%, oklch(from var(--jp-primary) l c h / 18%), transparent 35%, oklch(from var(--jp-accent) l c h / 14%), transparent 65%, oklch(from var(--jp-secondary) l c h / 18%))",
                mixBlendMode: "screen",
              }}
            />
            <div
              className="relative flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
              style={{
                borderColor: "var(--jp-border)",
                color: "var(--jp-accent)",
              }}
            >
              <Trophy className="size-3.5" />
              Winner
            </div>
            <motion.div
              initial={{ letterSpacing: "0.05em" }}
              animate={{ letterSpacing: "0.12em" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display text-4xl sm:text-5xl font-bold gradient-text leading-none"
              style={{ fontFamily: "var(--jp-font-heading)" }}
            >
              {title}
            </motion.div>
            {typeof amount === "number" && (
              <div
                className="font-display font-semibold leading-none"
                style={{
                  fontFamily: "var(--jp-font-heading)",
                  fontSize: "clamp(40px, 7vw, 80px)",
                  color: "var(--jp-text)",
                  textShadow:
                    "0 0 40px oklch(from var(--jp-accent) l c h / 60%)",
                }}
              >
                <RollingNumber
                  value={amount}
                  currency={currency}
                  locale={locale}
                  decimals={amount >= 10_000 ? 0 : 2}
                />
              </div>
            )}
            {(playerDisplay || subtitle) && (
              <div
                className="mt-1 text-sm"
                style={{ color: "var(--jp-muted)" }}
              >
                {playerDisplay ? (
                  <>
                    by <b style={{ color: "var(--jp-text)" }}>{playerDisplay}</b>
                  </>
                ) : (
                  subtitle
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
