import { PageHeader } from "@/components/admin/page-header";
import { WidgetForm } from "@/components/admin/widget-form";
import { getCurrentTenantId } from "@/lib/session";
import {
  getBrandsForTenant,
  getCampaignsForTenant,
  store,
} from "@/lib/data/store";
import { buildLiveCampaign } from "@/lib/public";
import type { LiveCampaign } from "@/components/widgets/shared";

export default async function NewWidgetPage() {
  const tenantId = await getCurrentTenantId();
  const brands = getBrandsForTenant(tenantId);
  const campaigns = getCampaignsForTenant(tenantId);
  // Pick from the full catalog (own themes first, then shared presets) so
  // operators can start from any approved look.
  const ownThemes = store.themes.filter((t) => t.tenantId === tenantId);
  const otherThemes = store.themes.filter((t) => t.tenantId !== tenantId);
  const themes = [...ownThemes, ...otherThemes];

  // Pre-build live snapshots for every campaign on the server so the form
  // can flip between them without calling into the store from the client.
  const liveByCampaign: Record<string, LiveCampaign> = {};
  for (const c of campaigns) {
    const live = buildLiveCampaign(c.id);
    if (live) liveByCampaign[c.id] = live;
  }

  return (
    <>
      <PageHeader
        title="New widget"
        description="Pick a surface, hook it up to a brand and campaign, then drop the embed anywhere."
      />
      <WidgetForm
        brands={brands}
        campaigns={campaigns}
        themes={themes}
        liveByCampaign={liveByCampaign}
      />
    </>
  );
}
