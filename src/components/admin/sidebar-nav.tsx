"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  Target,
  Paintbrush,
  Store,
  Key,
  Radio,
  BarChart3,
  FlaskConical,
  Settings,
  Sparkles,
  Users,
  Package,
} from "lucide-react";

const items = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard, exact: true },
  { href: "/admin/campaigns", label: "Campaigns", Icon: Trophy },
  { href: "/admin/crates", label: "Crate Drops", Icon: Package },
  { href: "/admin/widgets", label: "Widgets", Icon: Sparkles },
  { href: "/admin/themes", label: "Themes", Icon: Paintbrush },
  { href: "/admin/brands", label: "Brands", Icon: Store },
  { href: "/admin/keys", label: "API Keys", Icon: Key },
  { href: "/admin/winners", label: "Winners", Icon: Target },
  { href: "/admin/live", label: "Live Monitor", Icon: Radio },
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/admin/sandbox", label: "Sandbox", Icon: FlaskConical },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5 px-3 text-sm">
      {items.map(({ href, label, Icon, exact }) => {
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon
              className={cn(
                "size-4 transition-colors",
                active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            {label}
            {active && (
              <span className="ml-auto size-1.5 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
      <div className="mt-4 mx-3 border-t border-sidebar-border/60 pt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="size-3.5" />
        Super Admin · Ada Operator
      </div>
    </nav>
  );
}
