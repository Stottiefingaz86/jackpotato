import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";
import { getRecentWinners } from "@/lib/data/store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const auth = authenticateApiKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { searchParams } = new URL(req.url);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit") ?? 20))
  );
  const winners = getRecentWinners(limit, auth.apiKey.tenantId);
  return NextResponse.json(
    {
      winners: winners.map((w) => ({
        id: w.id,
        campaignId: w.campaignId,
        tierId: w.tierId,
        displayName: w.displayName,
        country: w.country,
        winAmount: w.winAmount,
        triggerType: w.triggerType,
        wonAt: w.wonAt,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=2, stale-while-revalidate=10",
      },
    }
  );
}
