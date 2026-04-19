import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";
import { getWidget } from "@/lib/data/store";
import { buildLiveCampaign, buildThemeForWidget } from "@/lib/public";

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
  const widget = getWidget(id);
  if (!widget || widget.tenantId !== auth.apiKey.tenantId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const live = buildLiveCampaign(widget.campaignId);
  const theme = buildThemeForWidget(widget.id);
  if (!live || !theme) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      widget: {
        id: widget.id,
        name: widget.name,
        type: widget.type,
        status: widget.status,
        config: widget.config,
      },
      campaign: live.campaign,
      tiers: live.tiers,
      theme,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=1, stale-while-revalidate=5",
      },
    }
  );
}
