import { notFound } from "next/navigation";
import { WidgetPreview } from "@/components/admin/widget-preview";
import { getRecentWinners, getWidget } from "@/lib/data/store";
import { buildLiveCampaign, buildThemeForWidget } from "@/lib/public";

export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ widgetId: string }>;
}) {
  const { widgetId } = await params;
  const w = getWidget(widgetId);
  return {
    title: w?.name ?? "Jackpot widget",
    other: {
      "color-scheme": "dark light",
    },
  };
}

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ widgetId: string }>;
}) {
  const { widgetId } = await params;
  const widget = getWidget(widgetId);
  if (!widget) notFound();
  const theme = buildThemeForWidget(widget.id)!;
  const live = buildLiveCampaign(widget.campaignId)!;
  const winners = getRecentWinners(10, widget.tenantId);

  return (
    <main className="p-3">
      <WidgetPreview
        widget={widget}
        theme={theme}
        live={live}
        winners={winners}
      />
    </main>
  );
}
