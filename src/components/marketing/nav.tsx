import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function MarketingNav() {
  const links = [
    { href: "/", label: "Home" },
    { href: "/#products", label: "Products" },
    { href: "/widgets-demo", label: "Widgets" },
    { href: "/crates", label: "Crates" },
    { href: "/#raffles", label: "Raffles" },
    { href: "/#faq", label: "FAQ" },
    { href: "/admin", label: "Dashboard" },
  ];
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
            // The logo is a small PNG that already ships at a fixed size, so
            // we skip Next's image optimizer. That also avoids the stale
            // optimized-image cache which otherwise keeps serving the old
            // logo after you replace the file on disk.
            unoptimized
            className="h-8 w-auto"
          />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {links.map((l) => (
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
