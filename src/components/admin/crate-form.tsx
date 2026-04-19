"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  Save,
  ArrowLeft,
  Trash2,
  Coins,
  Gift,
  Sparkles,
  Dice5,
  Zap,
  Upload,
  ImagePlus,
  X,
} from "lucide-react";
import { saveCrate, type CrateFormInput } from "@/app/actions/crates";
import type {
  Brand,
  CrateArtVariant,
  CratePrizeType,
  CrateRarity,
  CrateStatus,
  CrateUnlockTrigger,
} from "@/lib/types";
import { CrateCard, CrateArt } from "@/components/crates/crate-card";
import { cn } from "@/lib/utils";

const RARITY_OPTIONS: {
  value: CrateRarity;
  label: string;
  accent: string;
  from: string;
  to: string;
}[] = [
  { value: "common", label: "Common", accent: "#f4a261", from: "#c97b3f", to: "#f4a261" },
  { value: "rare", label: "Rare", accent: "#d8dee9", from: "#8a94a8", to: "#d8dee9" },
  { value: "epic", label: "Epic", accent: "#f6c042", from: "#d4a017", to: "#fde68a" },
  { value: "legendary", label: "Legendary", accent: "#d946ef", from: "#9333ea", to: "#ec4899" },
  { value: "mythic", label: "Mythic", accent: "#22d3ee", from: "#06b6d4", to: "#a855f7" },
];

const ART_VARIANTS: {
  value: CrateArtVariant;
  label: string;
  hint: string;
}[] = [
  { value: "chest", label: "Treasure chest", hint: "Lid splits open" },
  { value: "orb", label: "Glowing orb", hint: "Pulses then bursts" },
  { value: "gem", label: "Cut gem", hint: "Rotates and flashes" },
  { value: "card", label: "Mystery card", hint: "Flips to reveal" },
  { value: "vault", label: "Vault dial", hint: "Spins to unlock" },
  { value: "custom", label: "Custom image", hint: "Your own art, floats + fades" },
];

/** Read a local File as a base64 data-URL so it can round-trip through the
 * server action without a blob store. Good enough for the demo tenant;
 * production would POST to S3 / R2 and store a plain https URL. */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const TRIGGER_KINDS: {
  value: CrateUnlockTrigger["kind"];
  label: string;
  hint: string;
}[] = [
  { value: "stake_amount", label: "Stake threshold", hint: "Wager X in one bet" },
  { value: "spin_count", label: "Spin count", hint: "Play N rounds" },
  { value: "win_streak", label: "Win streak", hint: "Consecutive wins" },
  { value: "daily_login", label: "Daily login", hint: "Open once per day" },
  { value: "manual", label: "Manual / VIP", hint: "Granted by operators" },
];

const PRIZE_TYPES: {
  value: CratePrizeType;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "cash", label: "Cash", Icon: Coins },
  { value: "freespins", label: "Free spins", Icon: Sparkles },
  { value: "freebet", label: "Free bet", Icon: Dice5 },
  { value: "bonus", label: "Deposit bonus", Icon: Gift },
  { value: "multiplier", label: "Multiplier", Icon: Zap },
];

function defaultTriggerFor(
  kind: CrateUnlockTrigger["kind"],
  currency: string
): CrateUnlockTrigger {
  switch (kind) {
    case "stake_amount":
      return { kind: "stake_amount", threshold: 10, currency };
    case "spin_count":
      return { kind: "spin_count", count: 25 };
    case "win_streak":
      return { kind: "win_streak", streak: 3 };
    case "daily_login":
      return { kind: "daily_login" };
    case "manual":
      return { kind: "manual" };
  }
}

export function CrateForm({
  initial,
  brands,
}: {
  initial?: CrateFormInput;
  brands: Brand[];
}) {
  const [pending, start] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<CrateFormInput>(
    initial ?? {
      name: "",
      description: "",
      rarity: "rare",
      status: "draft",
      currency: brands[0]?.currency ?? "EUR",
      brandIds: brands.slice(0, 1).map((b) => b.id),
      unlockTrigger: { kind: "spin_count", count: 25 },
      maxOpensPerDay: 1,
      artVariant: "chest",
      artImageUrl: undefined,
      prizes: [
        { type: "freespins", label: "25 Free Spins", value: 25, weight: 55 },
        { type: "cash", label: "€5 cash", value: 5, weight: 30 },
        { type: "bonus", label: "50% reload", value: 50, weight: 12 },
        { type: "multiplier", label: "3x boost", value: 3, weight: 3 },
      ],
    }
  );

  async function handleImageUpload(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("That file doesn't look like an image");
      return;
    }
    // 2 MB is plenty for a square PNG/WebP crate icon; anything bigger
    // bloats the in-memory store and SSE payloads.
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image is larger than 2 MB — please compress it first");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({
        ...prev,
        artVariant: "custom",
        artImageUrl: dataUrl,
      }));
      toast.success("Image uploaded — preview is live");
    } catch {
      toast.error("Could not read that image");
    }
  }

  const rarityDef = RARITY_OPTIONS.find((r) => r.value === form.rarity)!;

  function patch<K extends keyof CrateFormInput>(key: K, value: CrateFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updatePrize(idx: number, patchP: Partial<CrateFormInput["prizes"][number]>) {
    setForm((prev) => ({
      ...prev,
      prizes: prev.prizes.map((p, i) => (i === idx ? { ...p, ...patchP } : p)),
    }));
  }

  function addPrize() {
    setForm((prev) => ({
      ...prev,
      prizes: [
        ...prev.prizes,
        { type: "cash", label: "New prize", value: 1, weight: 10 },
      ],
    }));
  }

  function removePrize(idx: number) {
    setForm((prev) => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== idx),
    }));
  }

  const totalWeight = form.prizes.reduce((s, p) => s + p.weight, 0) || 1;

  // Build a phantom Crate for the live preview so the operator can literally
  // click "Unlock crate" and watch their configured variant + rarity play out.
  const previewCrate = useMemo(() => {
    return {
      id: "preview",
      tenantId: "preview",
      brandIds: form.brandIds,
      name: form.name || "Untitled crate",
      description: form.description || "Configure your prize pool and unlock trigger.",
      rarity: form.rarity,
      status: form.status,
      currency: form.currency,
      color: form.color,
      artVariant: form.artVariant,
      artImageUrl: form.artImageUrl,
      unlockTrigger: form.unlockTrigger,
      maxOpensPerDay: form.maxOpensPerDay,
      prizes: form.prizes.map((p, i) => ({
        id: `pr_${i}`,
        type: p.type,
        label: p.label,
        value: p.value,
        weight: p.weight,
        currency: form.currency,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [form]);

  function submit() {
    if (!form.name.trim()) {
      toast.error("Give your crate a name");
      return;
    }
    if (form.prizes.length === 0) {
      toast.error("Add at least one prize");
      return;
    }
    if (form.brandIds.length === 0) {
      toast.error("Pick at least one brand");
      return;
    }
    start(async () => {
      await saveCrate(form);
      toast.success("Crate saved");
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
      <div className="space-y-6">
        {/* Basics */}
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
            <CardDescription>
              Name, rarity, and which brands see this crate.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="crt-name">Name</Label>
              <Input
                id="crt-name"
                placeholder="e.g. Weekend Warchest"
                value={form.name}
                onChange={(e) => patch("name", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="crt-desc">Description</Label>
              <Textarea
                id="crt-desc"
                rows={2}
                placeholder="What players see under the crate name."
                value={form.description}
                onChange={(e) => patch("description", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Rarity</Label>
              <div className="flex flex-wrap gap-2">
                {RARITY_OPTIONS.map((r) => {
                  const active = form.rarity === r.value;
                  return (
                    <button
                      type="button"
                      key={r.value}
                      onClick={() => patch("rarity", r.value)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors",
                        active
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      style={{
                        borderColor: active ? r.accent : "var(--border)",
                        background: active
                          ? `linear-gradient(90deg, ${r.from}22, ${r.to}22)`
                          : "transparent",
                      }}
                    >
                      <span
                        className="size-2.5 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${r.from}, ${r.to})`,
                        }}
                      />
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => patch("status", v as CrateStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Currency</Label>
                <Input
                  value={form.currency}
                  onChange={(e) =>
                    patch("currency", e.target.value.toUpperCase().slice(0, 3))
                  }
                  maxLength={3}
                />
              </div>
              <div className="grid gap-2">
                <Label>Max opens / day</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.maxOpensPerDay ?? ""}
                  placeholder="∞"
                  onChange={(e) =>
                    patch(
                      "maxOpensPerDay",
                      e.target.value === ""
                        ? null
                        : Math.max(0, Number(e.target.value))
                    )
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Eligible brands</Label>
              <div className="flex flex-wrap gap-2">
                {brands.map((b) => {
                  const active = form.brandIds.includes(b.id);
                  return (
                    <button
                      type="button"
                      key={b.id}
                      onClick={() =>
                        patch(
                          "brandIds",
                          active
                            ? form.brandIds.filter((x) => x !== b.id)
                            : [...form.brandIds, b.id]
                        )
                      }
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs transition-colors",
                        active
                          ? "border-primary/60 bg-primary/10 text-foreground"
                          : "border-border/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {b.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Animation / art */}
        <Card>
          <CardHeader>
            <CardTitle>Animation</CardTitle>
            <CardDescription>
              Pick a preset or upload your own artwork (PNG / SVG / WebP, square
              works best, up to 2 MB).
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {ART_VARIANTS.map((v) => {
                const active = form.artVariant === v.value;
                const isCustom = v.value === "custom";

                if (isCustom) {
                  return (
                    <button
                      type="button"
                      key={v.value}
                      onClick={() => {
                        // Open the OS file picker directly when the tile is
                        // clicked — no extra "Upload" click required.
                        fileInputRef.current?.click();
                      }}
                      className={cn(
                        "group relative flex flex-col items-center gap-2 rounded-xl border border-dashed p-3 text-center transition-colors",
                        active
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border/60 hover:border-border"
                      )}
                    >
                      <div className="grid h-20 w-full place-items-center">
                        {form.artImageUrl ? (
                          <CrateArt
                            variant="custom"
                            state="idle"
                            size="sm"
                            color={rarityDef.accent}
                            from={rarityDef.from}
                            to={rarityDef.to}
                            imageUrl={form.artImageUrl}
                          />
                        ) : (
                          <span className="grid size-14 place-items-center rounded-xl border border-dashed border-border/60 text-muted-foreground">
                            <ImagePlus className="size-6" />
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium leading-tight">
                          {v.label}
                        </div>
                        <div className="text-[11px] leading-tight text-muted-foreground">
                          {form.artImageUrl ? "Click to replace" : v.hint}
                        </div>
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    type="button"
                    key={v.value}
                    onClick={() => patch("artVariant", v.value)}
                    className={cn(
                      "group relative flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors",
                      // Active state uses a ring + primary border rather than
                      // a tinted background — the `bg-primary/5` fill made the
                      // selected tile look like a solid coloured block behind
                      // the label text, which users misread as a selection bar.
                      active
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border/60 hover:border-border"
                    )}
                  >
                    <div className="grid h-20 w-full place-items-center">
                      <CrateArt
                        variant={v.value}
                        state="idle"
                        size="sm"
                        color={rarityDef.accent}
                        from={rarityDef.from}
                        to={rarityDef.to}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium leading-tight">
                        {v.label}
                      </div>
                      <div className="text-[11px] leading-tight text-muted-foreground">
                        {v.hint}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                void handleImageUpload(file);
                // Reset so re-selecting the same file still fires onChange.
                e.target.value = "";
              }}
            />

            {form.artVariant === "custom" && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/10 px-3 py-2">
                <span className="text-xs text-muted-foreground">
                  {form.artImageUrl
                    ? "Using your uploaded artwork."
                    : "No image yet — upload one to see the custom animation."}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload data-icon="inline-start" />
                    {form.artImageUrl ? "Replace image" : "Upload image"}
                  </Button>
                  {form.artImageUrl && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          artImageUrl: undefined,
                          artVariant:
                            prev.artVariant === "custom"
                              ? "chest"
                              : prev.artVariant,
                        }))
                      }
                    >
                      <X data-icon="inline-start" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trigger */}
        <Card>
          <CardHeader>
            <CardTitle>Unlock trigger</CardTitle>
            <CardDescription>
              What the player has to do to earn this crate.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-5">
              {TRIGGER_KINDS.map((t) => {
                const active = form.unlockTrigger.kind === t.value;
                return (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() =>
                      patch(
                        "unlockTrigger",
                        defaultTriggerFor(t.value, form.currency)
                      )
                    }
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition-colors",
                      active
                        ? "border-primary/60 bg-primary/10"
                        : "border-border/60 hover:border-border"
                    )}
                  >
                    <span className="text-sm font-medium">{t.label}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {t.hint}
                    </span>
                  </button>
                );
              })}
            </div>

            {form.unlockTrigger.kind === "stake_amount" && (
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Threshold</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.unlockTrigger.threshold}
                    onChange={(e) =>
                      patch("unlockTrigger", {
                        kind: "stake_amount",
                        threshold: Number(e.target.value),
                        currency: form.unlockTrigger.kind === "stake_amount"
                          ? form.unlockTrigger.currency
                          : form.currency,
                      })
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Currency</Label>
                  <Input value={form.currency} disabled />
                </div>
              </div>
            )}
            {form.unlockTrigger.kind === "spin_count" && (
              <div className="grid gap-1.5 max-w-xs">
                <Label>Spins required</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.unlockTrigger.count}
                  onChange={(e) =>
                    patch("unlockTrigger", {
                      kind: "spin_count",
                      count: Math.max(1, Number(e.target.value)),
                    })
                  }
                />
              </div>
            )}
            {form.unlockTrigger.kind === "win_streak" && (
              <div className="grid gap-1.5 max-w-xs">
                <Label>Consecutive wins</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.unlockTrigger.streak}
                  onChange={(e) =>
                    patch("unlockTrigger", {
                      kind: "win_streak",
                      streak: Math.max(1, Number(e.target.value)),
                    })
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prize pool */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Prize pool</CardTitle>
              <CardDescription>
                Relative weights are normalised at open time. Total weight:{" "}
                <span className="tabular text-foreground">{totalWeight}</span>
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={addPrize}>
              <Plus data-icon="inline-start" />
              Add prize
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3">
            {form.prizes.map((p, idx) => {
              const pct = Math.round((p.weight / totalWeight) * 100);
              return (
                <div
                  key={idx}
                  className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-lg border border-border/60 bg-muted/10 p-3 sm:grid-cols-[120px_minmax(0,1fr)_120px_110px_110px_40px] sm:items-center"
                >
                  <Select
                    value={p.type}
                    onValueChange={(v) =>
                      updatePrize(idx, { type: v as CratePrizeType })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIZE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Label shown to players"
                    value={p.label}
                    onChange={(e) => updatePrize(idx, { label: e.target.value })}
                  />
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="Value"
                    value={p.value}
                    onChange={(e) =>
                      updatePrize(idx, { value: Number(e.target.value) })
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      placeholder="Weight"
                      value={p.weight}
                      onChange={(e) =>
                        updatePrize(idx, {
                          weight: Math.max(1, Number(e.target.value)),
                        })
                      }
                    />
                  </div>
                  <div className="text-xs text-muted-foreground tabular text-right">
                    {pct}% chance
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePrize(idx)}
                    aria-label="Remove prize"
                  >
                    <Trash2 />
                  </Button>
                </div>
              );
            })}
            {form.prizes.length === 0 && (
              <div className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                No prizes yet. Add one to get started.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            render={
              <Link href="/admin/crates">
                <ArrowLeft data-icon="inline-start" />
                Back
              </Link>
            }
          />
          <Button onClick={submit} disabled={pending} size="lg">
            <Save data-icon="inline-start" />
            {pending ? "Saving…" : initial?.id ? "Save crate" : "Create crate"}
          </Button>
        </div>
      </div>

      <div className="space-y-4 lg:sticky lg:top-24 h-fit">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
              Live preview
            </CardTitle>
            <CardDescription>
              Click the button to feel exactly what the player experiences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CrateCard crate={previewCrate} localSimulation />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
