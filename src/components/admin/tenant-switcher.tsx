"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { switchTenant } from "@/app/actions/session";

export function TenantSwitcher({
  tenants,
  currentId,
}: {
  tenants: Array<{ id: string; name: string; type: string }>;
  currentId: string;
}) {
  const [isPending, start] = useTransition();
  const current = tenants.find((t) => t.id === currentId);
  return (
    <Select
      value={currentId}
      onValueChange={(v) => {
        if (typeof v !== "string") return;
        start(async () => {
          await switchTenant(v);
        });
      }}
    >
      <SelectTrigger className="w-full" data-busy={isPending ? "true" : undefined}>
        <Building2 className="size-4" data-icon="inline-start" />
        <SelectValue>{current?.name ?? "Select tenant"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {tenants.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              <span className="flex flex-col">
                <span>{t.name}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {t.type}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
