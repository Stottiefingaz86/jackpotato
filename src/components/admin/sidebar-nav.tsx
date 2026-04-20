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
  Ticket,
  Zap,
  Gift,
  Boxes,
  ChevronRight,
} from "lucide-react";

type Item = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  soon?: boolean;
};

type Group = {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  items: Item[];
};

const OVERVIEW: Item = {
  href: "/admin",
  label: "Overview",
  Icon: LayoutDashboard,
  exact: true,
};

const GROUPS: Group[] = [
  {
    id: "jackpots",
    label: "Jackpots",
    Icon: Zap,
    items: [
      { href: "/admin/campaigns", label: "Campaigns", Icon: Trophy },
      { href: "/admin/winners", label: "Winners", Icon: Target },
      { href: "/admin/live", label: "Live Monitor", Icon: Radio },
      { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
    ],
  },
  {
    id: "rewards",
    label: "Rewards",
    Icon: Gift,
    items: [
      { href: "/admin/crates", label: "Crate Drops", Icon: Package },
      { href: "/admin/raffles", label: "Raffles", Icon: Ticket },
      {
        href: "/admin/rewards/analytics",
        label: "Analytics",
        Icon: BarChart3,
      },
      {
        href: "/admin/cash-races",
        label: "Cash Races",
        Icon: Trophy,
        soon: true,
      },
      {
        href: "/admin/challenges",
        label: "Challenges",
        Icon: Target,
        soon: true,
      },
    ],
  },
  {
    id: "platform",
    label: "Platform",
    Icon: Boxes,
    items: [
      { href: "/admin/widgets", label: "Widgets", Icon: Sparkles },
      { href: "/admin/themes", label: "Themes", Icon: Paintbrush },
      { href: "/admin/brands", label: "Brands", Icon: Store },
      { href: "/admin/keys", label: "API Keys", Icon: Key },
      { href: "/admin/sandbox", label: "Sandbox", Icon: FlaskConical },
      { href: "/admin/settings", label: "Settings", Icon: Settings },
    ],
  },
];

function NavLink({
  item,
  active,
}: {
  item: Item;
  active: boolean;
}) {
  const { href, label, Icon, soon } = item;
  const className = cn(
    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
    soon && "opacity-60"
  );

  const content = (
    <>
      <Icon
        className={cn(
          "size-4 transition-colors",
          active
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      {label}
      {soon ? (
        <span className="ml-auto rounded-full bg-muted/40 px-1.5 py-px text-[10px] uppercase tracking-wide text-muted-foreground">
          Soon
        </span>
      ) : active ? (
        <span className="ml-auto size-1.5 rounded-full bg-primary" />
      ) : null}
    </>
  );

  if (soon) {
    return (
      <span
        className={cn(className, "cursor-not-allowed")}
        aria-disabled
        title={`${label} — coming soon`}
      >
        {content}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export function SidebarNav() {
  const pathname = usePathname();
  const isActive = (item: Item) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <nav className="flex flex-col gap-4 px-3 text-sm">
      <div>
        <NavLink item={OVERVIEW} active={isActive(OVERVIEW)} />
      </div>

      {GROUPS.map((group) => {
        const GroupIcon = group.Icon;
        return (
          <div key={group.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-2 px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <GroupIcon className="size-3.5 text-primary/80" />
              {group.label}
              <ChevronRight className="ml-auto size-3 opacity-30" />
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(item)} />
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-4 mx-3 border-t border-sidebar-border/60 pt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="size-3.5" />
        Super Admin · Ada Operator
      </div>
    </nav>
  );
}
