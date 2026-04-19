"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { saveCampaign, type CampaignFormInput } from "@/app/actions/campaigns";
import type { Brand } from "@/lib/types";
import { formatMoney } from "@/lib/theme";

const DEFAULT_TIER_COLORS = [
  "#a855f7",
  "#22d3ee",
  "#f59e0b",
  "#ef4444",
  "#10b981",
];

export function CampaignForm({
  initial,
  brands,
}: {
  initial?: CampaignFormInput;
  brands: Brand[];
}) {
  const [form, setForm] = useState<CampaignFormInput>(
    initial ?? {
      name: "",
      description: "",
      type: "progressive",
      status: "draft",
      currency: brands[0]?.currency ?? "USD",
      contributionRate: 0.01,
      seedAmount: 10000,
      resetAmount: 5000,
      brandIds: brands.slice(0, 1).map((b) => b.id),
      mustDropEnabled: false,
      tiers: [
        {
          name: "mega",
          displayLabel: "Mega",
          splitPercent: 70,
          seedAmount: 10000,
          resetAmount: 5000,
          color: DEFAULT_TIER_COLORS[0],
        },
        {
          name: "major",
          displayLabel: "Major",
          splitPercent: 20,
          seedAmount: 2000,
          resetAmount: 1000,
          color: DEFAULT_TIER_COLORS[1],
        },
        {
          name: "minor",
          displayLabel: "Minor",
          splitPercent: 10,
          seedAmount: 500,
          resetAmount: 250,
          color: DEFAULT_TIER_COLORS[2],
        },
      ],
    }
  );
  const [isPending, start] = useTransition();

  const splitSum = useMemo(
    () => form.tiers.reduce((s, t) => s + Number(t.splitPercent || 0), 0),
    [form.tiers]
  );
  const splitOk = Math.round(splitSum * 100) === 10000;

  function update<K extends keyof CampaignFormInput>(
    key: K,
    value: CampaignFormInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateTier(i: number, patch: Partial<CampaignFormInput["tiers"][number]>) {
    setForm((prev) => {
      const tiers = [...prev.tiers];
      tiers[i] = { ...tiers[i], ...patch };
      return { ...prev, tiers };
    });
  }

  function addTier() {
    setForm((prev) => ({
      ...prev,
      tiers: [
        ...prev.tiers,
        {
          name: `tier_${prev.tiers.length + 1}`,
          displayLabel: `Tier ${prev.tiers.length + 1}`,
          splitPercent: 0,
          seedAmount: 100,
          resetAmount: 50,
          color: DEFAULT_TIER_COLORS[prev.tiers.length % DEFAULT_TIER_COLORS.length],
        },
      ],
    }));
  }

  function removeTier(i: number) {
    setForm((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((_, idx) => idx !== i),
    }));
  }

  function toggleBrand(brandId: string) {
    setForm((prev) => {
      const has = prev.brandIds.includes(brandId);
      return {
        ...prev,
        brandIds: has
          ? prev.brandIds.filter((b) => b !== brandId)
          : [...prev.brandIds, brandId],
      };
    });
  }

  function submit() {
    if (!splitOk) {
      toast.error("Tier splits must total 100%");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    start(async () => {
      try {
        await saveCampaign(form);
      } catch (err) {
        toast.error("Failed to save");
        console.error(err);
      }
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="xl:col-span-2 grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
            <CardDescription>
              Name, description, type and status of this campaign.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Cosmic Fortune Progressive"
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Three-tier progressive jackpot across all slots"
              />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => update("type", v as CampaignFormInput["type"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="progressive">Progressive</SelectItem>
                  <SelectItem value="must_drop">Must drop</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="network_ready">Network-ready</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => update("status", v as CampaignFormInput["status"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Currency</Label>
              <Input
                value={form.currency}
                onChange={(e) => update("currency", e.target.value.toUpperCase())}
                maxLength={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Brands</Label>
              <div className="flex flex-wrap gap-2">
                {brands.map((b) => {
                  const on = form.brandIds.includes(b.id);
                  return (
                    <button
                      type="button"
                      key={b.id}
                      onClick={() => toggleBrand(b.id)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${on ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground"}`}
                    >
                      {b.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiers</CardTitle>
            <CardDescription>
              Splits must total 100%. Current total:{" "}
              <span className={splitOk ? "text-emerald-400" : "text-amber-400"}>
                {splitSum.toFixed(2)}%
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {form.tiers.map((t, i) => (
              <div
                key={i}
                className="grid gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 md:grid-cols-[auto_1fr_1fr_1fr_1fr_auto]"
              >
                <div className="flex flex-col items-center gap-1.5">
                  <input
                    type="color"
                    value={t.color ?? "#a855f7"}
                    onChange={(e) => updateTier(i, { color: e.target.value })}
                    className="size-10 cursor-pointer rounded-full border-0 bg-transparent"
                  />
                  <Badge variant="outline" className="text-[10px]">
                    #{i + 1}
                  </Badge>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={t.displayLabel}
                    onChange={(e) => {
                      updateTier(i, {
                        displayLabel: e.target.value,
                        name: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                      });
                    }}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Split %</Label>
                  <Input
                    type="number"
                    step={0.1}
                    value={t.splitPercent}
                    onChange={(e) =>
                      updateTier(i, {
                        splitPercent: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Seed</Label>
                  <Input
                    type="number"
                    value={t.seedAmount}
                    onChange={(e) =>
                      updateTier(i, { seedAmount: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Must drop at</Label>
                  <Input
                    type="number"
                    placeholder="Optional"
                    value={t.mustDropAmount ?? ""}
                    onChange={(e) =>
                      updateTier(i, {
                        mustDropAmount: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <button
                  type="button"
                  className="grid size-9 place-items-center self-end rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => removeTier(i)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <Button variant="outline" type="button" onClick={addTier}>
              <Plus data-icon="inline-start" />
              Add tier
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Contribution</CardTitle>
            <CardDescription>
              Share of each bet that funds the pool.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Label>Contribution rate</Label>
                <span className="text-sm font-medium tabular">
                  {(form.contributionRate * 100).toFixed(2)}%
                </span>
              </div>
              <Slider
                value={[form.contributionRate * 10000]}
                onValueChange={(v) => {
                  const n = Array.isArray(v) ? v[0] : v;
                  update("contributionRate", n / 10000);
                }}
                min={1}
                max={500}
                step={1}
                className="mt-2"
              />
            </div>
            <div className="grid gap-2">
              <Label>Seed amount</Label>
              <Input
                type="number"
                value={form.seedAmount}
                onChange={(e) => update("seedAmount", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Starting value. Current formatted:{" "}
                {formatMoney(form.seedAmount, form.currency)}
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Reset amount</Label>
              <Input
                type="number"
                value={form.resetAmount}
                onChange={(e) => update("resetAmount", Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Must-drop</CardTitle>
            <CardDescription>
              Guarantee a drop before a threshold or interval is hit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="mb-0">Enable must-drop</Label>
              <Switch
                checked={form.mustDropEnabled}
                onCheckedChange={(v) => update("mustDropEnabled", v)}
              />
            </div>
            {form.mustDropEnabled && (
              <div className="grid gap-2">
                <Label>Max interval (seconds)</Label>
                <Input
                  type="number"
                  value={form.maxDropIntervalSeconds ?? ""}
                  onChange={(e) =>
                    update(
                      "maxDropIntervalSeconds",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="86400"
                />
              </div>
            )}
          </CardContent>
        </Card>
        <Button
          onClick={submit}
          disabled={isPending}
          size="lg"
          className="h-11 w-full rounded-full"
        >
          <Save data-icon="inline-start" />
          {isPending ? "Saving..." : initial ? "Save changes" : "Create campaign"}
        </Button>
      </div>
    </div>
  );
}
