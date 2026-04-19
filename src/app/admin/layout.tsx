import Image from "next/image";
import Link from "next/link";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { TenantSwitcher } from "@/components/admin/tenant-switcher";
import { ConnectionIndicator } from "@/components/admin/connection-indicator";
import { ConsoleFilter } from "@/components/admin/console-filter";
import { store } from "@/lib/data/store";
import { getCurrentTenantId } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenantId = await getCurrentTenantId();
  const tenants = store.tenants.map((t) => ({
    id: t.id,
    name: t.name,
    type: t.type,
  }));
  const current = store.tenants.find((t) => t.id === tenantId);

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[260px_1fr] bg-background">
      <ConsoleFilter />
      <aside className="hidden md:flex flex-col gap-6 border-r border-sidebar-border/70 bg-sidebar py-6">
        <div className="px-5 flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center"
            aria-label="TurboPot home"
          >
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
        </div>
        <div className="px-3">
          <TenantSwitcher tenants={tenants} currentId={tenantId} />
        </div>
        <SidebarNav />
        <div className="mt-auto flex flex-col gap-2 px-5">
          <ConnectionIndicator />
          <div className="text-[11px] text-muted-foreground">
            Tenant <span className="text-foreground">{current?.name}</span>
          </div>
        </div>
      </aside>
      <div className="flex min-h-screen flex-col">
        <header className="md:hidden flex items-center justify-between border-b border-border/60 px-4 py-3 bg-background/80 backdrop-blur sticky top-0 z-30">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-display font-semibold"
            aria-label="TurboPot admin"
          >
            <Image
              src="/logo.png"
              alt="TurboPot"
              width={440}
              height={128}
              unoptimized
              className="h-6 w-auto"
            />
            <span className="text-xs text-muted-foreground">Admin</span>
          </Link>
          <ConnectionIndicator label="" />
        </header>
        <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
