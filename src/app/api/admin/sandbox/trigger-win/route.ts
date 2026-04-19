import { NextResponse } from "next/server";
import { triggerWin } from "@/lib/engine";
import { getTiersForCampaign } from "@/lib/data/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    campaignId?: string;
    tierId?: string;
  };
  if (!body.campaignId) {
    return NextResponse.json(
      { success: false, error: "campaignId is required" },
      { status: 400 }
    );
  }
  const tiers = getTiersForCampaign(body.campaignId);
  if (tiers.length === 0) {
    return NextResponse.json(
      { success: false, error: "campaign has no tiers" },
      { status: 404 }
    );
  }
  const tierId = body.tierId ?? tiers[0].id;
  const win = triggerWin(body.campaignId, tierId, "manual");
  if (!win) {
    return NextResponse.json(
      { success: false, error: "could not trigger win" },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true, win });
}
