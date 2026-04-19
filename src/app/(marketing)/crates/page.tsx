import Link from "next/link";
import { ArrowRight, Package, Sparkles, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CrateCard } from "@/components/crates/crate-card";
import { getCratesForTenant } from "@/lib/data/store";

export default function CratesShowcasePage() {
  const crates = getCratesForTenant("tnt_jackpotato");
  const live = crates.filter((c) => c.status === "live");
  const draft = crates.filter((c) => c.status !== "live");

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 flex flex-col gap-12">
      <header className="flex flex-col gap-4">
        <Badge variant="outline" className="rounded-full w-fit">
          <Package data-icon="inline-start" />
          Crate Drops
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight max-w-3xl">
          Turn every spin into a <span className="gradient-text">reward loop</span>.
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Crate Drops sit on top of Jackpotato and give operators another engagement dial.
          Players unlock crates through gameplay — and pop them open to reveal cash, free
          spins, free bets, deposit matches, and multipliers. Try opening one below.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            render={
              <Link href="/admin/crates">
                Configure crates <ArrowRight data-icon="inline-end" />
              </Link>
            }
            className="rounded-full"
          />
          <Button
            variant="outline"
            render={<Link href="/widgets-demo">See all widgets</Link>}
            className="rounded-full"
          />
        </div>
      </header>

      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="font-display text-2xl font-semibold">Live crates</h2>
          <Badge variant="secondary" className="rounded-full">
            Tap to open
          </Badge>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {live.map((c) => (
            <CrateCard key={c.id} crate={c} />
          ))}
        </div>
      </section>

      {draft.length > 0 && (
        <section className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-primary" />
            <h2 className="font-display text-2xl font-semibold">Coming soon</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {draft.map((c) => (
              <CrateCard key={c.id} crate={c} unlocked={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
