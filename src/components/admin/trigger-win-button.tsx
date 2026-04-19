"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { toast } from "sonner";

export function TriggerWinButton({
  campaignId,
  tierId,
  label = "Trigger test win",
}: {
  campaignId: string;
  tierId?: string;
  label?: string;
}) {
  const [isPending, start] = useTransition();

  function fire() {
    start(async () => {
      const res = await fetch("/api/admin/sandbox/trigger-win", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, tierId }),
      });
      if (res.ok) toast.success("Win triggered. Celebrations incoming.");
      else toast.error("Failed to trigger win");
    });
  }

  return (
    <Button onClick={fire} disabled={isPending} className="rounded-full">
      <Trophy data-icon="inline-start" />
      {label}
    </Button>
  );
}
