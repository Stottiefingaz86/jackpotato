"use client";

import type { ReactNode } from "react";
import {
  Home,
  Heart,
  Clock,
  Sparkles,
  Dices,
  Trophy,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A slim faux casino-sidenav so promo widgets can be viewed at realistic size
 * (≈ 240px). Used on the /rewards marketing page to show `SidebarPromo`s in
 * context rather than stretched across a column.
 */
export function SidenavMock({
  children,
  className,
  brand = "Operator",
}: {
  children: ReactNode;
  className?: string;
  brand?: string;
}) {
  const navItems = [
    { Icon: Home, label: "Lobby", active: true },
    { Icon: Sparkles, label: "New Games" },
    { Icon: Dices, label: "Originals" },
    { Icon: Heart, label: "Favorites" },
    { Icon: Clock, label: "Recent" },
  ];

  return (
    <div
      className={cn(
        "w-full max-w-[248px] rounded-2xl border bg-[color:var(--jp-bg,theme(colors.card))]/80 p-2 overflow-hidden",
        className
      )}
      style={{
        borderColor:
          "oklch(from var(--jp-card-2, oklch(0.24 0.028 275)) calc(l + 0.07) c h / 45%)",
      }}
    >
      {/* Brand strip */}
      <div className="flex items-center gap-2 px-2 py-2 mb-1">
        <span
          className="grid size-6 place-items-center rounded-md text-[10px] font-bold text-background"
          style={{
            background: "var(--jp-primary, oklch(0.72 0.22 300))",
          }}
        >
          {brand[0]}
        </span>
        <span className="text-sm font-semibold truncate">{brand}</span>
      </div>

      {/* Top nav items */}
      <nav className="mb-3">
        {navItems.map(({ Icon, label, active }) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm",
              active
                ? "bg-[color:var(--jp-card-2,theme(colors.muted))]/60 font-medium"
                : "text-muted-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
          </div>
        ))}
      </nav>

      {/* Promotions section — where our widgets go */}
      <div className="mb-2 px-2 flex items-center gap-2">
        <Percent className="size-3.5 text-muted-foreground" />
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
          Promotions
        </span>
      </div>
      <div className="space-y-1">{children}</div>

      {/* Footer nav */}
      <div
        className="mt-3 pt-2 border-t space-y-0.5"
        style={{
          borderColor:
            "oklch(from var(--jp-card-2, oklch(0.24 0.028 275)) calc(l + 0.04) c h / 30%)",
        }}
      >
        {[
          { Icon: Trophy, label: "VIP" },
          { Icon: Heart, label: "Rewards" },
        ].map(({ Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground"
          >
            <Icon className="size-4" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
