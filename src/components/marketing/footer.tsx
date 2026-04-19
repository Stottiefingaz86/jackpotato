import Image from "next/image";
import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/50 mt-24 py-12 text-sm text-muted-foreground">
      <div className="mx-auto max-w-7xl px-6 grid gap-8 md:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Image
            src="/logo.png"
            alt="TurboPot"
            width={440}
            height={128}
            unoptimized
            className="h-7 w-auto"
            style={{ height: 28, width: "auto", maxWidth: 140 }}
          />
          <p className="max-w-xs">
            Flexible. Powerful. Your jackpot engine. Built for operators, vendors and brands who want real-time excitement without hardcoding jackpot logic into every game.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-foreground font-medium">Product</span>
          <Link href="/widgets-demo" className="hover:text-foreground">Widgets</Link>
          <Link href="/admin" className="hover:text-foreground">Admin dashboard</Link>
          <Link href="/admin/sandbox" className="hover:text-foreground">Sandbox</Link>
          <Link href="/admin/api-keys" className="hover:text-foreground">API</Link>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-foreground font-medium">Jackpots</span>
          <span>Progressive</span>
          <span>Must-drop</span>
          <span>Local</span>
          <span>Network-ready</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-foreground font-medium">Company</span>
          <span>About</span>
          <span>Careers</span>
          <span>News</span>
          <span>Contact</span>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 mt-10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>© 2026 TurboPot — The complete jackpot engagement stack.</span>
        <span className="text-xs uppercase tracking-widest">Certified · Trusted · Built to win</span>
      </div>
    </footer>
  );
}
