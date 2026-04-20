"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowRight,
  ChevronDown,
  Zap,
  Gift,
  Package,
  Ticket,
  Trophy,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
};

const PRIMARY_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/widgets-demo", label: "Widgets" },
  { href: "/#faq", label: "FAQ" },
  { href: "/admin", label: "Dashboard" },
];

export function MarketingNav() {
  const pathname = usePathname();
  const isProductsActive =
    pathname === "/jackpots" ||
    pathname.startsWith("/jackpots/") ||
    pathname === "/rewards" ||
    pathname.startsWith("/rewards/") ||
    pathname === "/crates" ||
    pathname.startsWith("/crates/");

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center" aria-label="TurboPot home">
          <Image
            src="/logo.png"
            alt="TurboPot"
            width={440}
            height={128}
            priority
            unoptimized
            className="h-8 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <Link
            href="/"
            className="hover:text-foreground transition-colors"
          >
            Home
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex items-center gap-1 outline-none transition-colors hover:text-foreground data-[popup-open]:text-foreground",
                isProductsActive && "text-foreground"
              )}
            >
              Products
              <ChevronDown className="size-3.5 opacity-60 transition-transform data-[popup-open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={10}
              className="w-[340px] p-2"
            >
              <DropdownMenuItem
                render={
                  <Link href="/jackpots" className="cursor-pointer">
                    <div className="flex items-start gap-3 p-1.5">
                      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Zap className="size-4" />
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          Jackpot Engine
                        </span>
                        <span className="text-xs leading-snug text-muted-foreground">
                          Progressive pots, tiers, must-drop timers and live
                          widgets.
                        </span>
                      </div>
                    </div>
                  </Link>
                }
              />
              <DropdownMenuItem
                render={
                  <Link href="/rewards" className="cursor-pointer">
                    <div className="flex items-start gap-3 p-1.5">
                      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Gift className="size-4" />
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                          Rewards Platform
                          <span className="rounded-full bg-primary/15 px-1.5 py-px text-[10px] uppercase tracking-wide text-primary">
                            New
                          </span>
                        </span>
                        <span className="text-xs leading-snug text-muted-foreground">
                          Engagement, loyalty & gamification — crates,
                          raffles, races, missions.
                        </span>
                      </div>
                    </div>
                  </Link>
                }
              />
              <div className="mx-2 my-1.5 h-px bg-border/60" />
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Jump to
              </div>
              <DropdownMenuItem
                render={
                  <Link href="/crates" className="cursor-pointer">
                    <span className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                      <Package className="size-3.5" />
                      Crate Drops
                    </span>
                  </Link>
                }
              />
              <DropdownMenuItem
                render={
                  <Link href="/rewards#raffles" className="cursor-pointer">
                    <span className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                      <Ticket className="size-3.5" />
                      Raffles
                    </span>
                  </Link>
                }
              />
              <DropdownMenuItem
                render={
                  <Link href="/rewards#roadmap" className="cursor-pointer">
                    <span className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                      <Trophy className="size-3.5" />
                      Cash Races
                      <span className="ml-auto text-[10px] text-muted-foreground/70">
                        soon
                      </span>
                    </span>
                  </Link>
                }
              />
              <DropdownMenuItem
                render={
                  <Link href="/rewards#roadmap" className="cursor-pointer">
                    <span className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                      <Target className="size-3.5" />
                      Challenges & Missions
                      <span className="ml-auto text-[10px] text-muted-foreground/70">
                        soon
                      </span>
                    </span>
                  </Link>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>

          {PRIMARY_LINKS.slice(1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            render={<Link href="/admin">Sign in</Link>}
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex"
          />
          <Button
            render={
              <Link href="/admin">
                Book a Demo
                <ArrowRight data-icon="inline-end" />
              </Link>
            }
            size="sm"
            className="rounded-full"
          />
        </div>
      </div>
    </header>
  );
}
