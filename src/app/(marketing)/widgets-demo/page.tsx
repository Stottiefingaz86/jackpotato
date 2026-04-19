import { WidgetGallery } from "./widget-gallery";
import { buildLiveCampaign } from "@/lib/public";
import { getRecentWinners, store } from "@/lib/data/store";
import { resolveTheme } from "@/lib/theme";

export default function WidgetsDemoPage() {
  // Pull every theme from the store so newly-added presets show up here
  // automatically. We used to hardcode 4 IDs which silently dropped any
  // theme created via the admin editor or added to the seed.
  const themes = store.themes
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((t) => ({
      id: t.id,
      name: t.name,
      tokens: resolveTheme({ widgetTheme: t }),
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
