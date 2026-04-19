import { NextResponse } from "next/server";
import { authenticateApiKey, takeIdempotent } from "@/lib/api-auth";
import { ingestBetEvent } from "@/lib/engine";

export const runtime = "nodejs";

interface BetIngestBody {
  playerId: string;
  brandId: string;
  gameId: string;
  gameGroup: string;
  stakeAmount: number;
  currency: string;
  externalRef?: string;
  timestamp?: string;
}

export async function POST(req: Request) {
  const auth = authenticateApiKey(req, "secret");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (
    !auth.apiKey.permissions.includes("event.write") &&
    !auth.apiKey.permissions.includes("events:write")
  ) {
    return NextResponse.json(
      { error: "forbidden", reason: "event.write permission required" },
      { status: 403 }
    );
  }

  let body: BetIngestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const missing = (
    [
      "playerId",
      "brandId",
      "gameId",
      "gameGroup",
      "stakeAmount",
      "currency",
    ] as const
  ).filter((k) => (body as Record<string, unknown>)[k] == null);
  if (missing.length) {
    return NextResponse.json(
      { error: "missing_fields", fields: missing },
      { status: 400 }
    );
  }

  const idemKey =
    req.headers.get("idempotency-key") ?? body.externalRef ?? null;

  const { body: result, replayed } = takeIdempotent(idemKey, () => {
    return ingestBetEvent({
      tenantId: auth.apiKey.tenantId,
      brandId: body.brandId,
      playerId: body.playerId,
      gameId: body.gameId,
      gameGroup: body.gameGroup,
      stakeAmount: body.stakeAmount,
      currency: body.currency,
      externalRef: body.externalRef,
      timestamp: body.timestamp,
    });
  });

  return NextResponse.json(
    { replayed, ...result },
    { status: replayed ? 200 : 202 }
  );
}
