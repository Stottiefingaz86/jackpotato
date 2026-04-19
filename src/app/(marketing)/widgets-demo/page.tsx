import { WidgetGallery } from "./widget-gallery";
import { buildLiveCampaign, buildThemeById } from "@/lib/public";
import { getRecentWinners, store } from "@/lib/data/store";

export default function WidgetsDemoPage() {
  const themes = [
    { id: "thm_neon_midnight", name: "Neon Midnight" },
    { id: "thm_royal_gold", name: "Royal Gold" },
    { id: "thm_crypto_sunset", name: "Crypto Sunset" },
    { id: "thm_casino_classic", name: "Casino Classic" },
  ].map((t) => ({
    id: t.id,
    name: t.name,
    tokens: buildThemeById(t.id)!,
  }));

  const campaignsMeta = store.campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    currency: c.currency,
  }));

  const liveByCampaign = Object.fromEntries(
    store.campaigns.map((c) => [c.id, buildLiveCampaign(c.id)!])
  );

  return (
    <WidgetGallery
      themes={themes}
      campaigns={campaignsMeta}
      liveByCampaign={liveByCampaign}
      winners={getRecentWinners(30)}
    />
  );
}
