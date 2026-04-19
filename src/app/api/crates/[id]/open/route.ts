import { NextResponse } from "next/server";
import { openCrate } from "@/lib/crate-engine";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    playerId?: string;
    displayName?: string;
    country?: string;
  };
  const result = openCrate({
    crateId: id,
    playerId: body.playerId,
    displayName: body.displayName,
    country: body.country,
  });
  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
