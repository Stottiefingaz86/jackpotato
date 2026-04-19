import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";
import { getCampaign } from "@/lib/data/store";
import { buildLiveCampaign } from "@/lib/public";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateApiKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const campaign = getCampaign(id);
  if (!campaign || campaign.tenantId !== auth.apiKey.tenantId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const live = buildLiveCampaign(id);
  if (!live) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      campaign: {
        ...live.campaign,
        status: campaign.status,
      },
      tiers: live.tiers,
      total: live.tiers.reduce((s, t) => s + t.currentAmount, 0),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=1, stale-while-revalidate=5",
      },
    }
  );
}
