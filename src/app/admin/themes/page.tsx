import { PageHeader } from "@/components/admin/page-header";
import { ThemeEditor } from "@/components/admin/theme-editor";
import { getCurrentTenantId } from "@/lib/session";
import {
  getCampaignsForTenant,
  getThemesForTenant,
} from "@/lib/data/store";
import { buildLiveCampaign } from "@/lib/public";

export default async function ThemesPage() {
  const tenantId = await getCurrentTenantId();
  const themes = getThemesForTenant(tenantId);
  const campaigns = getCampaignsForTenant(tenantId);
  const live = buildLiveCampaign(campaigns[0]?.id ?? "")!;

  return (
    <>
      <PageHeader
        title="Themes"
        description="Visual tokens that cascade from platform → tenant → brand → widget. Every widget reacts to edits in real time."
      />
      <ThemeEditor themes={themes} initial={themes[0]} live={live} />
    </>
  );
}
