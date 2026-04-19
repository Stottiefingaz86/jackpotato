"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Copy, Key, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createApiKey, revokeApiKey } from "@/app/actions/api-keys";
import type { ApiKey, ApiKeyType } from "@/lib/types";

const PERMISSIONS = [
  "events:write",
  "jackpots:read",
  "widgets:read",
  "winners:read",
  "admin:write",
];

export function ApiKeyManager({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [label, setLabel] = useState("Production Ingestion");
  const [type, setType] = useState<ApiKeyType>("secret");
  const [permissions, setPermissions] = useState<string[]>([
    "events:write",
    "jackpots:read",
  ]);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  function toggle(p: string) {
    setPermissions((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function create() {
    if (!label.trim()) {
      toast.error("Label is required");
      return;
    }
    start(async () => {
      const { id, plaintext } = await createApiKey({
        label,
        type,
        permissions,
      });
      setRevealed(plaintext);
      setKeys((prev) => [
        ...prev,
        {
          id,
          tenantId: "",
          label,
          type,
          preview: `${type === "secret" ? "sk_live_" : "pk_live_"}${"•".repeat(4)}${plaintext.slice(-4)}`,
          hashedKey: "",
          permissions,
          lastUsedAt: null,
          revokedAt: null,
          createdAt: new Date().toISOString(),
        },
      ]);
      toast.success("API key created");
    });
  }

  function revoke(id: string) {
    start(async () => {
      await revokeApiKey(id);
      setKeys((prev) =>
        prev.map((k) =>
          k.id === id ? { ...k, revokedAt: new Date().toISOString() } : k
        )
      );
      toast("Key revoked");
    });
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Create new key</CardTitle>
            <CardDescription>
              Secret keys sign server-to-server requests. Public keys are
              embedded in browsers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Label</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Lucky7 production"
              />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as ApiKeyType)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="secret">Secret (server)</SelectItem>
                  <SelectItem value="public">Public (browser)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Permissions</Label>
              <div className="flex flex-wrap gap-1.5">
                {PERMISSIONS.map((p) => {
                  const on = permissions.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggle(p)}
                      className={`rounded-full border px-2.5 py-1 text-xs transition ${on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button
              onClick={create}
              disabled={isPending}
              className="w-full rounded-full"
            >
              <Plus data-icon="inline-start" />
              Create key
            </Button>
          </CardContent>
        </Card>

        {revealed && (
          <Card className="border-emerald-500/40 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-300">
                <Key className="size-4" />
                Copy your key — you won’t see it again
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-black/40 p-2 font-mono text-xs">
                <code className="flex-1 truncate">{revealed}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copy(revealed)}
                >
                  <Copy data-icon="inline-start" />
                  Copy
                </Button>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2"
                onClick={() => setRevealed(null)}
              >
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Keys</CardTitle>
          <CardDescription>
            Rotate secrets regularly. Revoked keys are rejected immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.label}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={k.type === "secret" ? "text-amber-300" : ""}
                    >
                      {k.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{k.preview}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {k.permissions.map((p) => (
                        <Badge
                          key={p}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="tabular text-muted-foreground">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {k.revokedAt ? (
                      <Badge variant="outline" className="text-destructive">
                        Revoked
                      </Badge>
                    ) : (
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => revoke(k.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 data-icon="inline-start" />
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
